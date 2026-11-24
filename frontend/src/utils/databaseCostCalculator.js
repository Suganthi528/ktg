// Database Cost Calculator — frontend only, no backend, no external APIs
// All prices are estimates from manually maintained config files.

const USD_TO_INR = 93;

// MB per customer record (docs, photos, loan data)
const MB_PER_CUSTOMER = 5;
// Reads per customer per day
const READS_PER_CUSTOMER_PER_DAY = 20;
// Writes per customer per day
const WRITES_PER_CUSTOMER_PER_DAY = 8;
// DB connections per 10 users
const CONNECTIONS_PER_10_USERS = 3;

/**
 * Derive DB usage numbers from client config
 */
export function deriveDbUsage(config) {
  const customers      = Math.max(0, Number(config.customers)      || 0);
  const users          = Math.max(0, Number(config.users)          || 0);
  const branches       = Math.max(0, Number(config.branches)       || 0);
  const dailyTx        = Math.max(0, Number(config.dailyTransactions) || Math.round(customers * 0.1));
  const storageGB      = Math.max(0, Number(config.storageGB)      || (customers * MB_PER_CUSTOMER) / 1024);
  const backupGB       = Math.max(0, Number(config.backupGB)        || storageGB * 2);
  const dailyReads     = Math.max(0, Number(config.dailyReads)      || customers * READS_PER_CUSTOMER_PER_DAY);
  const dailyWrites    = Math.max(0, Number(config.dailyWrites)     || customers * WRITES_PER_CUSTOMER_PER_DAY);
  const monthlyQueries = Math.max(0, Number(config.monthlyQueries)  || (dailyReads + dailyWrites) * 30);
  const connections    = Math.max(0, Number(config.connections)     || Math.ceil(users / 10) * CONNECTIONS_PER_10_USERS);
  const replicas       = Math.max(0, Number(config.replicas)        || 0);
  const ha             = !!config.ha;
  const records        = Math.max(0, Number(config.records)         || customers * 50);

  return {
    customers, users, branches, dailyTx, storageGB, backupGB,
    dailyReads, dailyWrites, monthlyQueries, connections,
    replicas, ha, records,
  };
}

/**
 * Pick the smallest plan that satisfies the usage requirements
 */
export function pickDbPlan(plans, usage) {
  const { storageGB, connections } = usage;
  const suitable = plans.filter(
    (p) => p.storage >= storageGB && p.connections >= connections
  );
  if (suitable.length > 0) return suitable[0];
  // fallback: largest plan
  return plans[plans.length - 1];
}

/**
 * Calculate cost for one database service on one provider
 */
export function calcDbServiceCost(service, usage, usdToInr = USD_TO_INR) {
  const plan = pickDbPlan(service.plans, usage);

  const computeUsd = plan.pricePerMonth;

  // Storage overage (above what's included in plan)
  const storageOverage = Math.max(0, usage.storageGB - (plan.storage || 0));
  const storageUsd     = storageOverage * (plan.storagePerGB || 0);

  // Backup cost
  const backupUsd = usage.backupGB * (plan.backupPerGB || 0);

  // IOPS (only for plans that charge separately)
  const iopsUsd = (plan.iopsPerUnit || 0) > 0
    ? Math.max(0, usage.dailyReads + usage.dailyWrites) / 1000 * plan.iopsPerUnit
    : 0;

  // Read / write costs (serverless models like DynamoDB, Firestore, Cosmos)
  const monthlyReads  = usage.dailyReads  * 30;
  const monthlyWrites = usage.dailyWrites * 30;
  const readUsd  = (monthlyReads  / 1_000_000) * (plan.readPerMillion  || 0);
  const writeUsd = (monthlyWrites / 1_000_000) * (plan.writePerMillion || 0);

  // Network / data-transfer cost
  const networkUsd = usage.storageGB * 0.1 * (plan.networkPerGB || 0); // assume 10% of storage transferred/month

  // Replication cost (additional instance per replica)
  const replicationUsd = usage.replicas * computeUsd;

  // HA cost (doubles the instance for multi-AZ)
  const haUsd = usage.ha ? (plan.haCost || computeUsd) : 0;

  const totalUsd = computeUsd + storageUsd + backupUsd + iopsUsd + readUsd + writeUsd + networkUsd + replicationUsd + haUsd;
  const totalInr = totalUsd * usdToInr;
  const gstInr   = totalInr * 0.18;

  return {
    provider:    service.id,
    serviceName: service.name,
    plan,
    computeUsd,
    storageUsd,
    backupUsd,
    iopsUsd,
    readUsd,
    writeUsd,
    networkUsd,
    replicationUsd,
    haUsd,
    totalUsd:     parseFloat(totalUsd.toFixed(2)),
    totalInr:     Math.round(totalInr),
    gstInr:       Math.round(gstInr),
    totalWithGst: Math.round(totalInr + gstInr),
    annualInr:    Math.round(totalInr * 11),
    annualWithGst:Math.round((totalInr + gstInr) * 11),
  };
}

/**
 * Scale simulation steps
 */
export const DB_SCALE_STEPS = [500, 1000, 5000, 10000, 50000, 100000];

export function simulateDbScale(service, baseConfig) {
  return DB_SCALE_STEPS.map((customers) => {
    const cfg   = { ...baseConfig, customers };
    const usage = deriveDbUsage(cfg);
    const cost  = calcDbServiceCost(service, usage);
    return { customers, usage, cost };
  });
}

/**
 * Compare all services across all providers for a given usage
 */
export function compareAllDatabases(providers, usage) {
  const results = [];
  providers.forEach((provider) => {
    provider.services.forEach((service) => {
      const cost = calcDbServiceCost(service, usage, USD_TO_INR);
      results.push({ provider, service, cost });
    });
  });
  results.sort((a, b) => a.cost.totalWithGst - b.cost.totalWithGst);
  return results;
}

export const inrFmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
export const usdFmt = (n) => '$' + parseFloat(n).toFixed(2);
