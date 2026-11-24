// Service Cost Engine — frontend only, no backend, no external APIs
// Calculates cost per service line item based on billing model + user config.

export const USD_TO_INR = 93;
export const GST_PCT    = 18;
export const HRS_PER_MONTH = 730;

// ─── Core calculator ──────────────────────────────────────────────────────────

/**
 * Calculate cost for a single service line item.
 * @param {object} svc   – service definition from SERVICE_CATALOG
 * @param {object} plan  – selected plan object (may be null for storage-only)
 * @param {object} cfg   – user configuration
 * @param {string} billingModel
 * @param {object} extraCosts
 * @returns {object} breakdown
 */
export function calcServiceCost(svc, plan, typeConfig, cfg, billingModel, extraCosts = {}) {
  const qty          = Math.max(1, Number(cfg.instances)   || 1);
  const usageHours   = Math.max(0, Number(cfg.usageHours)  || HRS_PER_MONTH);
  const storageGB    = Math.max(0, Number(cfg.storageGB)   || 0);
  const bandwidthGB  = Math.max(0, Number(cfg.bandwidthGB) || 0);
  const requests     = Math.max(0, Number(cfg.requests)    || 0);
  const iops         = Math.max(0, Number(cfg.iops)        || 0);
  const writeOps     = Math.max(0, Number(cfg.writeOps)    || 0);
  const readOps      = Math.max(0, Number(cfg.readOps)     || 0);
  const backupGB     = Math.max(0, Number(cfg.backupGB)    || 0);

  let baseCost = 0;
  let storageCost = 0;
  let bandwidthCost = 0;
  let requestCost   = 0;
  let iopsCost      = 0;
  let backupCost    = 0;
  let additionalCost = 0;
  let note = '';

  // ── 1. Hourly billing (EC2, VMs, RDS, Cloud SQL) ──
  if (billingModel === 'hourly') {
    const hourlyRate = plan?.pricePerHour || 0;
    baseCost = hourlyRate * usageHours * qty;

    // OS surcharge (AWS EC2 Windows)
    const osSurcharge = extraCosts?.os?.[cfg.os] || 0;
    additionalCost += osSurcharge * usageHours * qty;

    // HA multiplier (RDS Multi-AZ, Cloud SQL HA)
    if (cfg.ha && extraCosts?.multiAZMultiplier) {
      baseCost *= extraCosts.multiAZMultiplier;
    }
    if (cfg.ha && extraCosts?.haMultiplier) {
      baseCost *= extraCosts.haMultiplier;
    }

    note = `${plan?.name} @ $${hourlyRate}/hr × ${usageHours}h × ${qty} instance(s)`;
  }

  // ── 2. Fixed monthly billing (Droplets, Linode, Render, Railway, DO DB) ──
  if (billingModel === 'fixed') {
    // plan-level fixed price
    if (plan?.pricePerMonth !== undefined) {
      baseCost = plan.pricePerMonth * qty;
      note = `${plan.name} @ $${plan.pricePerMonth}/mo × ${qty}`;
    }
    // typeConfig-level fixed (no plan needed, e.g. Netlify tiers)
    else if (typeConfig?.pricePerMonth !== undefined) {
      baseCost = typeConfig.pricePerMonth * qty;
    }
    // Backup as % of base (DO / Linode)
    if (extraCosts?.pctOfDroplet) {
      baseCost = (cfg.baseDropletCost || 0) * extraCosts.pctOfDroplet;
    }
    if (extraCosts?.pctOfLinode) {
      baseCost = (cfg.baseLinodeCost || 0) * extraCosts.pctOfLinode;
    }
    // Bandwidth overage
    const bwFree = Number(extraCosts?.bandwidthFree || plan?.bandwidth || 0);
    const bwOverage = Math.max(0, bandwidthGB - bwFree);
    bandwidthCost = bwOverage * (extraCosts?.bandwidthOveragePerGB || extraCosts?.bandwidthPerGB || 0);

    // Build minutes overage (Netlify)
    if (extraCosts?.buildMinutesPer500 && cfg.buildMinutes) {
      const incl = plan?.buildMinutes || 300;
      const overageBlocks = Math.ceil(Math.max(0, cfg.buildMinutes - incl) / 500);
      additionalCost += overageBlocks * extraCosts.buildMinutesPer500;
    }

    // HA
    if (cfg.ha && extraCosts?.haMultiplier) baseCost *= extraCosts.haMultiplier;
  }

  // ── 3. Per-GB billing (S3, Blob, Cloud Storage, EBS) ──
  if (billingModel === 'per_gb') {
    const ratePerGB = typeConfig?.pricePerGB || plan?.pricePerGB || 0;
    baseCost = ratePerGB * storageGB * qty;
    note = `${storageGB} GB × $${ratePerGB}/GB`;

    // IOPS (EBS io1/io2)
    if (typeConfig?.iopsPerUnit && iops > 0) {
      iopsCost = iops * typeConfig.iopsPerUnit;
    }

    // Object storage: included base price + overage (DO Spaces, Linode Object)
    if (typeConfig?.basePrice) {
      const inclStorage = typeConfig.includedStorage || 0;
      const extraStorage = Math.max(0, storageGB - inclStorage);
      baseCost = typeConfig.basePrice + extraStorage * (typeConfig.extraStoragePerGB || 0);
      const inclBW = typeConfig.includedBandwidth || 0;
      bandwidthCost = Math.max(0, bandwidthGB - inclBW) * (typeConfig.extraBandwidthPerGB || 0);
    }
  }

  // ── 4. Per-million requests (Lambda, DynamoDB, Firestore, API GW) ──
  if (billingModel === 'per_million') {
    const reqRate   = extraCosts?.requestPricePerMillion || typeConfig?.requestPricePerMillion || 0;
    const readRate  = extraCosts?.readPerMillion  || typeConfig?.readPerMillion  || 0;
    const writeRate = extraCosts?.writePerMillion || typeConfig?.writePerMillion || 0;
    const incl      = extraCosts?.includedRequests || typeConfig?.includedRequests || 0;
    const billableReq = Math.max(0, requests - incl);
    requestCost = (billableReq / 1_000_000) * reqRate;

    // Duration (Lambda)
    if (extraCosts?.durationPricePerGBSec && cfg.durationMs && cfg.memoryMB) {
      const gbSec = (cfg.memoryMB / 1024) * (cfg.durationMs / 1000) * Math.max(0, requests);
      const inclGBSec = extraCosts.includedGBSec || 0;
      additionalCost += Math.max(0, gbSec - inclGBSec) * extraCosts.durationPricePerGBSec;
    }

    // DynamoDB / Firestore read + write
    requestCost += (readOps  / 1_000_000) * readRate;
    requestCost += (writeOps / 1_000_000) * writeRate;

    // Edge/Serverless overages (Vercel / Netlify)
    if (typeConfig?.overagePerMillion) {
      const inclInv = typeConfig?.includedInvocations || 0;
      const overage = Math.max(0, requests - inclInv);
      requestCost = (overage / 1_000_000) * typeConfig.overagePerMillion;
    }
    note = `${requests.toLocaleString('en-IN')} requests`;
  }

  // ── 5. Per-CPU-hour (Cloud Run) ──
  if (billingModel === 'per_cpu_hr') {
    const cpu = Number(cfg.cpu) || 1;
    const ram = Number(cfg.ram) || 2;
    baseCost = (cpu * (extraCosts?.cpuPerVCPUSec || 0) + ram * (extraCosts?.ramPerGBSec || 0)) * usageHours * 3600 * qty;
    const reqRate = extraCosts?.requestPricePerMillion || 0;
    const incl    = extraCosts?.includedRequests || 0;
    requestCost   = Math.max(0, (requests - incl) / 1_000_000) * reqRate;
  }

  // ── Common: storage cost (separate from base, e.g. RDS/Aurora storage) ──
  if (extraCosts?.storagePerGB && storageGB > 0) {
    const inclStorage = plan?.storage || 0;
    const overageStorage = Math.max(0, storageGB - inclStorage);
    storageCost = overageStorage * extraCosts.storagePerGB;
  }
  if (extraCosts?.storageOveragePerGB && storageGB > 0) {
    const inclStorage = plan?.storage || 0;
    storageCost = Math.max(0, storageGB - inclStorage) * extraCosts.storageOveragePerGB;
  }

  // ── Common: backup ──
  if (extraCosts?.backupPerGB && backupGB > 0) {
    backupCost = backupGB * extraCosts.backupPerGB;
  }

  // ── Common: bandwidth cost (non-fixed models) ──
  if (billingModel !== 'fixed' && extraCosts?.bandwidthPerGB && bandwidthGB > 0) {
    const free = extraCosts?.dataTransferFree || 0;
    bandwidthCost = Math.max(0, bandwidthGB - free) * extraCosts.bandwidthPerGB;
  }

  // ── Totals ──
  const subtotalUSD   = baseCost + storageCost + bandwidthCost + requestCost + iopsCost + backupCost + additionalCost;
  const totalUSD      = subtotalUSD;
  const totalINR      = totalUSD * USD_TO_INR;
  const gst           = totalINR * (GST_PCT / 100);
  const totalWithGST  = totalINR + gst;

  return {
    baseCost:       parseFloat(baseCost.toFixed(2)),
    storageCost:    parseFloat(storageCost.toFixed(2)),
    bandwidthCost:  parseFloat(bandwidthCost.toFixed(2)),
    requestCost:    parseFloat(requestCost.toFixed(2)),
    iopsCost:       parseFloat(iopsCost.toFixed(2)),
    backupCost:     parseFloat(backupCost.toFixed(2)),
    additionalCost: parseFloat(additionalCost.toFixed(2)),
    totalUSD:       parseFloat(totalUSD.toFixed(2)),
    totalINR:       Math.round(totalINR),
    gst:            Math.round(gst),
    totalWithGST:   Math.round(totalWithGST),
    annualINR:      Math.round(totalINR * 11),
    annualWithGST:  Math.round(totalWithGST * 11),
    note,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const inrFmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
export const usdFmt = (n) => '$' + parseFloat(n || 0).toFixed(2);

/** Sum an array of cost objects */
export function sumCosts(items) {
  return items.reduce(
    (acc, it) => ({
      totalUSD:     acc.totalUSD     + (it.cost?.totalUSD  || 0),
      totalINR:     acc.totalINR     + (it.cost?.totalINR  || 0),
      gst:          acc.gst          + (it.cost?.gst       || 0),
      totalWithGST: acc.totalWithGST + (it.cost?.totalWithGST || 0),
    }),
    { totalUSD: 0, totalINR: 0, gst: 0, totalWithGST: 0 }
  );
}

/** Group line items by category */
export function groupByCategory(items) {
  return items.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
}

/** Generate a unique id for a line item */
export const newId = () => Math.random().toString(36).slice(2, 9);
