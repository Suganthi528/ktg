// Multi-Cloud Pricing Calculator Utility
// All calculations run entirely in the browser — no backend required.

const USD_TO_INR = 93;

// Pick the smallest plan whose capacity >= load
export function pickPlan(plans, load) {
  return plans.find((p) => p.cap >= load) || plans[plans.length - 1];
}

// Pro-rata price between adjacent plans
export function proPriceUsd(plans, plan, load) {
  const i = plans.indexOf(plan);
  if (i <= 0) return plan.pricePerMonth;
  const prev = plans[i - 1];
  const frac = Math.min(1, Math.max(0, (load - prev.cap) / (plan.cap - prev.cap)));
  return prev.pricePerMonth + (plan.pricePerMonth - prev.pricePerMonth) * frac;
}

// Module resource weights (how much each active module adds to load)
export const MODULE_WEIGHTS = {
  core:              { cpu: 1.0, ram: 1.0, db: 1.0, storage: 1.0, bandwidth: 1.0 },
  mfi:               { cpu: 0.55, ram: 0.5, db: 0.8, storage: 0.6, bandwidth: 0.5 },
  jewelLoan:         { cpu: 0.3, ram: 0.3, db: 0.5, storage: 0.4, bandwidth: 0.3 },
  hrManagement:      { cpu: 0.4, ram: 0.4, db: 0.5, storage: 0.3, bandwidth: 0.3 },
  liveTracking:      { cpu: 0.35, ram: 0.3, db: 0.3, storage: 0.2, bandwidth: 0.6 },
  mobileApp:         { cpu: 0.4, ram: 0.4, db: 0.4, storage: 0.3, bandwidth: 0.5 },
  customerMgmt:      { cpu: 0.2, ram: 0.2, db: 0.4, storage: 0.3, bandwidth: 0.2 },
  employeeMgmt:      { cpu: 0.2, ram: 0.2, db: 0.3, storage: 0.2, bandwidth: 0.2 },
  branchMgmt:        { cpu: 0.15, ram: 0.15, db: 0.2, storage: 0.15, bandwidth: 0.15 },
  reportsAnalytics:  { cpu: 0.5, ram: 0.6, db: 0.7, storage: 0.5, bandwidth: 0.4 },
  paymentIntegration:{ cpu: 0.3, ram: 0.25, db: 0.4, storage: 0.2, bandwidth: 0.4 },
  notifications:     { cpu: 0.2, ram: 0.2, db: 0.2, storage: 0.1, bandwidth: 0.3 },
  backupRecovery:    { cpu: 0.3, ram: 0.25, db: 0.3, storage: 0.8, bandwidth: 0.2 },
  documentMgmt:      { cpu: 0.25, ram: 0.25, db: 0.3, storage: 0.7, bandwidth: 0.3 },
  apiIntegration:    { cpu: 0.35, ram: 0.3, db: 0.3, storage: 0.1, bandwidth: 0.5 },
};

// Base resource requirements per scale unit
const BASE_CPU_PER_100_USERS    = 0.5;  // vCPU
const BASE_RAM_PER_100_USERS    = 0.5;  // GB
const BASE_DB_PER_1000_CLIENTS  = 2;    // GB
const BASE_STORAGE_PER_1000_CLIENTS = 5; // GB
const BASE_BW_PER_100_USERS     = 10;   // GB/mo

/**
 * Calculate resource requirements from client config + active modules
 */
export function calculateResources(config, activeModules) {
  const { users = 0, branches = 0, clients = 0, admins = 0,
          concurrentUsers = 0, mau = 0, apiPerDay = 0,
          dailyTransactions = 0, dbUsageGB = 0, storageGB = 0,
          bandwidthGB = 0, backupGB = 0 } = config;

  // Module multiplier (sum of weights for active modules)
  const totalWeight = (key) =>
    activeModules.reduce((sum, m) => sum + (MODULE_WEIGHTS[m]?.[key] || 0), 0) || 1;

  const cpuMult    = totalWeight('cpu');
  const ramMult    = totalWeight('ram');
  const dbMult     = totalWeight('db');
  const storageMult = totalWeight('storage');
  const bwMult     = totalWeight('bandwidth');

  const effectiveUsers  = Math.max(users, mau / 30, concurrentUsers * 10, 1);
  const effectiveClients = Math.max(clients, 1);

  // Compute load score (matches existing pricing.model.js load formula)
  const callsPerUserPerDay = 298 + (activeModules.includes('mfi') ? 165 : 0) +
    (activeModules.includes('mobileApp') ? 89 : 0) +
    (activeModules.includes('hrManagement') ? 165 : 0) +
    (activeModules.includes('jewelLoan') ? 165 : 0) +
    (activeModules.includes('liveTracking') ? 143 : 0);

  const dailyCalls = effectiveUsers * callsPerUserPerDay;
  const peakPerMin = dailyCalls * 0.0224;
  const serverLoad = peakPerMin / 4;
  const dbLoad = effectiveClients / 50 + dailyCalls / 100;

  // CPU / RAM requirements (vCPU / GB)
  const cpuRequired = Math.max(
    1,
    (effectiveUsers / 100) * BASE_CPU_PER_100_USERS * cpuMult +
    (apiPerDay / 100000) * 0.5
  );
  const ramRequired = Math.max(
    1,
    (effectiveUsers / 100) * BASE_RAM_PER_100_USERS * ramMult +
    (dailyTransactions / 10000) * 0.2
  );

  // Storage / DB / Bandwidth
  const dbRequired = Math.max(
    dbUsageGB || 0,
    (effectiveClients / 1000) * BASE_DB_PER_1000_CLIENTS * dbMult
  );
  const storageRequired = Math.max(
    storageGB || 0,
    (effectiveClients / 1000) * BASE_STORAGE_PER_1000_CLIENTS * storageMult +
    (backupGB || 0)
  );
  const bwRequired = Math.max(
    bandwidthGB || 0,
    (effectiveUsers / 100) * BASE_BW_PER_100_USERS * bwMult
  );

  return {
    cpuRequired: parseFloat(cpuRequired.toFixed(2)),
    ramRequired: parseFloat(ramRequired.toFixed(2)),
    dbRequired:  parseFloat(dbRequired.toFixed(2)),
    storageRequired: parseFloat(storageRequired.toFixed(2)),
    bwRequired:  parseFloat(bwRequired.toFixed(2)),
    serverLoad:  parseFloat(serverLoad.toFixed(2)),
    dbLoad:      parseFloat(dbLoad.toFixed(2)),
    dailyCalls:  Math.round(dailyCalls),
  };
}

/**
 * Calculate monthly cost for a single platform
 */
export function calculatePlatformCost(platform, resources, usdToInr = USD_TO_INR, gstPct = 18) {
  const { serverLoad, dbLoad, storageRequired, bwRequired } = resources;

  const serverPlan = pickPlan(platform.plans, serverLoad);
  const dbPlan     = pickPlan(platform.dbPlans, dbLoad);

  const serverUsd = proPriceUsd(platform.plans, serverPlan, serverLoad);
  const dbUsd     = proPriceUsd(platform.dbPlans, dbPlan, dbLoad);

  const storageBase    = platform.storageBasePrice || 0;
  const storageOverage = Math.max(0, storageRequired - (platform.storageFree || 0));
  const storageUsd     = storageBase + storageOverage * (platform.storageBase || 0);

  const bwFree    = platform.bandwidthFree || 0;
  const bwOverage = Math.max(0, bwRequired - bwFree);
  const bwUsd     = bwOverage * (platform.bandwidthBase || 0);

  const totalUsd    = serverUsd + dbUsd + storageUsd + bwUsd;
  const totalInr    = totalUsd * usdToInr;
  const gst         = totalInr * (gstPct / 100);
  const totalWithGst = totalInr + gst;

  return {
    platform: platform.id,
    platformName: platform.name,
    serverPlan,
    dbPlan,
    serverUsd: parseFloat(serverUsd.toFixed(2)),
    dbUsd:     parseFloat(dbUsd.toFixed(2)),
    storageUsd: parseFloat(storageUsd.toFixed(2)),
    bwUsd:     parseFloat(bwUsd.toFixed(2)),
    totalUsd:  parseFloat(totalUsd.toFixed(2)),
    totalInr:  Math.round(totalInr),
    gst:       Math.round(gst),
    totalWithGst: Math.round(totalWithGst),
    annualInr: Math.round(totalInr * 11),  // 1 month free
    annualWithGst: Math.round(totalWithGst * 11),
  };
}

/**
 * Calculate costs for all selected platforms and return a comparison
 */
export function calculateAllPlatforms(platforms, resources, usdToInr = USD_TO_INR, gstPct = 18) {
  const results = platforms.map((p) => calculatePlatformCost(p, resources, usdToInr, gstPct));
  const sorted  = [...results].sort((a, b) => a.totalWithGst - b.totalWithGst);

  const cheapest   = sorted[0];
  const bestCapacity = results.reduce((best, r) =>
    (r.serverPlan.cap > best.serverPlan.cap ? r : best), results[0]);

  return {
    results,
    sorted,
    cheapest,
    bestCapacity,
    recommended: cheapest,
  };
}

/**
 * Scale simulation: compute cost for a given user count across all platforms
 */
export const SCALE_STEPS = [100, 500, 1000, 5000, 10000, 50000, 100000];

export function simulateScale(platforms, baseConfig, activeModules, usdToInr = USD_TO_INR) {
  return SCALE_STEPS.map((userCount) => {
    const cfg = { ...baseConfig, users: userCount, clients: userCount * 5, mau: userCount };
    const res = calculateResources(cfg, activeModules);
    const costs = calculateAllPlatforms(platforms, res, usdToInr);
    return { userCount, resources: res, costs };
  });
}

export const inrFmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
export const usdFmt = (n) => '$' + parseFloat(n).toFixed(2);
