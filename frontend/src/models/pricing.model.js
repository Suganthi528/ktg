// All money in INR. Defaults are editable in the UI (saved in localStorage).
export const DEFAULT_RATES = {
  usdToInr: 93,
  // Linode plans (USD/month); cap = capacity points vs computed load
  plans: [
    { name: 'Nanode 1GB', usd: 5, cap: 40 },
    { name: 'Linode 2GB', usd: 12, cap: 120 },
    { name: 'Linode 4GB', usd: 24, cap: 300 },
    { name: 'Linode 8GB', usd: 48, cap: 700 },
    { name: 'Linode 16GB', usd: 96, cap: 1600 },
    { name: 'Linode 32GB', usd: 192, cap: 3500 },
    { name: 'Linode 64GB', usd: 384, cap: 8000 },
    { name: 'Linode 96GB', usd: 576, cap: 16000 },
    { name: 'Linode 128GB', usd: 768, cap: 32000 },
  ],
  // API traffic model, calibrated from Sarvam's real API report (Nov 2026):
  // 250 users, avg working day = 2,15,314 calls (14 full working days), peak = 4,821 calls/min.
  // Per-module split comes from "Top APIs today" (169,251 calls):
  //   menu-badges/base web shell 34.6% | MFI endpoints 37.0% | live tracking ping 16.6%
  //   mobile-only app calls 10.3% | HR attendance 1.4% | jewel loan 0.08% (no real record -> tiny assumption)
  // MFI, HR and Jewel loan are assumed to generate the same traffic per user: the measured MFI+HR pool
  // (318+12 = 330 per user) is split equally (165 each), so Sarvam's real set still totals ~2,15,000 calls/day.
  callsVersion: 3,
  callsPerUserPerDay: { base: 298, mfi: 165, mobileApp: 89, hr: 165, jewelLoan: 165, tracking: 143 },
  peakShare: 0.0224, // busiest minute = 2.24% of that day's calls (4,821 / 2,15,314)
  callsPerLoadPoint: 4, // 1 plan "load point" = 4 peak calls/min (16GB cap 1600 = 6,400 calls/min)
  dbCallsPerLoadPoint: 100, // DB load = clients/50 + dailyCalls/100
  serverPricing: 'prorata', // 'prorata' (price follows load) | 'tier' (full price of the chosen plan)
  linodeBackupPct: 25, // % of plan price
  sharedTenants: 5, // clients sharing one server when "shared"
  // DigitalOcean managed DB
  dbPlans: [
    { name: 'DB 1GB', usd: 15, cap: 150 },
    { name: 'DB 2GB', usd: 30, cap: 500 },
    { name: 'DB 4GB', usd: 60, cap: 1500 },
    { name: 'DB 8GB', usd: 120, cap: 4000 },
    { name: 'DB 16GB', usd: 240, cap: 10000 },
    { name: 'DB 32GB', usd: 480, cap: 25000 },
    { name: 'DB 64GB', usd: 960, cap: 60000 },
  ],
  spacesUsdPer250GB: 5, // DO Spaces base (250GB)
  spacesExtraUsdPerGB: 0.02,
  mbPerClient: 5, // docs/photos per client (MB)
  // Google Maps Platform usage per tracked user per working day.
  // Calibrated from Sarvam's real report (14-20 Nov 2026, 6 active days, 47 users):
  // 49 map loads, 621 roads calls, 0 places  =>  ~0.2 loads and ~2.2 roads / user / day.
  mapJsPerUserPerDay: 0.2,
  mapRoadsPerUserPerDay: 2.2,
  mapSearchPerUserPerDay: 0,
  mapDetailsPerUserPerDay: 0,
  workDaysPerMonth: 26,
  // Google price per 1000 calls AFTER the free monthly allowance (verify in Google Cloud pricing)
  mapUsdPer1000: 7, // Maps JavaScript (dynamic map loads)
  roadsUsdPer1000: 10, // Roads - snap to roads
  searchUsdPer1000: 2.83, // Places Autocomplete (per session)
  detailsUsdPer1000: 17, // Places Details
  // Free monthly allowance per API (matches Google's report)
  mapFree: { js: 10000, roads: 5000, search: 10000, details: 10000 },
  // Selling side
  markupPct: 40,
  perUser: 150,
  perBranch: 500,
  perClient: 1,
  moduleFee: { backup: 500, tracking: 1500, mfi: 3000, hr: 2000, mobileApp: 2500, jewelLoan: 2000 },
  setupFee: 10000,
  yearDiscountPct: 8.33, // 1 month free out of 12 (pay 11 months)
  gstPct: 18, // GST on software/hosting services (India)
};

const pick = (list, load) => list.find((p) => p.cap >= load) || list[list.length - 1];

// Pro-rata price: moves smoothly between the previous plan's price and this plan's price
// as load grows, so adding/removing a module changes the bill (not only at a tier jump).
// r.serverPricing = 'tier' keeps the old behaviour (full price of the chosen plan).
function priceUsd(list, plan, load, mode) {
  const i = list.indexOf(plan);
  if (mode === 'tier' || i <= 0) return plan.usd;
  const prev = list[i - 1];
  const frac = Math.min(1, Math.max(0, (load - prev.cap) / (plan.cap - prev.cap)));
  return prev.usd + (plan.usd - prev.usd) * frac;
}

export function calculate(inp, rIn) {
  // Fill any missing keys (old saved rates / old quotes) with current defaults
  const r = { ...DEFAULT_RATES, ...rIn, callsPerUserPerDay: (rIn && rIn.callsVersion === DEFAULT_RATES.callsVersion && rIn.callsPerUserPerDay) || DEFAULT_RATES.callsPerUserPerDay, callsVersion: DEFAULT_RATES.callsVersion, mapFree: { ...DEFAULT_RATES.mapFree, ...(rIn && rIn.mapFree) } };
  const fx = r.usdToInr;
  const users = Math.max(0, Number(inp.users) || 0);
  const branches = Math.max(0, Number(inp.branches) || 0);
  const clients = Math.max(0, Number(inp.clients) || 0);
  const trackedUsers = Math.max(
    0,
    inp.trackedUsers !== undefined && inp.trackedUsers !== '' ? Number(inp.trackedUsers) : users
  );
  const { mode, backup, tracking, mfi, hr, mobileApp, jewelLoan, backupFreq = 'daily' } = inp;
  // Customer pays only for the add-on modules he selects: no module => nothing to pay.
  const active = !!(tracking || mfi || hr || mobileApp || jewelLoan);
  const tracked = tracking ? Math.min(trackedUsers, users) : 0;
  const ovr = inp.overrides || {};

  // ---- API traffic -> server load (see callsPerUserPerDay in DEFAULT_RATES) ----
  const cpu = r.callsPerUserPerDay;
  const moduleCalls = {
    base: users * cpu.base,
    mfi: mfi ? users * cpu.mfi : 0,
    mobileApp: mobileApp ? users * cpu.mobileApp : 0,
    hr: hr ? users * cpu.hr : 0,
    jewelLoan: jewelLoan ? users * cpu.jewelLoan : 0,
    tracking: tracking ? tracked * cpu.tracking : 0,
  };
  const dailyCalls = Object.values(moduleCalls).reduce((a, b) => a + b, 0);
  const peakPerMin = dailyCalls * r.peakShare;
  const load = peakPerMin / r.callsPerLoadPoint;
  const plan = pick(r.plans, load);
  const dbLoad = clients / 50 + dailyCalls / r.dbCallsPerLoadPoint;
  const dbPlan = pick(r.dbPlans, dbLoad);

  const planUsd = priceUsd(r.plans, plan, load, r.serverPricing);
  const dbUsd = priceUsd(r.dbPlans, dbPlan, dbLoad, r.serverPricing);

  const share = mode === 'shared' ? 1 / r.sharedTenants : 1;
  const autoLinode = active ? Math.round(planUsd * fx * share) : 0;

  // Backup frequency multiplier: yearly gets 1 month discount (11/12)
  let backupMult = 1;
  if (backupFreq === 'weekly') backupMult = 0.85;
  else if (backupFreq === 'monthly') backupMult = 0.7;
  else if (backupFreq === 'yearly') backupMult = 11 / 12;

  const autoLinodeBackup = backup && active
    ? Math.round(planUsd * (r.linodeBackupPct / 100) * fx * share * backupMult)
    : 0;
  const autoDb = active ? Math.round(dbUsd * fx * share) : 0;

  const storageMult = backupFreq === 'monthly' ? 1.5 : backupFreq === 'weekly' ? 2 : 3;
  const dataGB = (clients * r.mbPerClient) / 1024 + tracked * 0.3;
  const storageGB = backup ? dataGB * storageMult : dataGB; // retained backup copies
  const extra = Math.max(0, storageGB - 250);
  const autoStorage = !active ? 0 : Math.round((r.spacesUsdPer250GB + extra * r.spacesExtraUsdPerGB) * fx * share);

  // Monthly Google Maps usage, minus Google's free allowance per API, then priced per 1000
  const monthlyCalls = (perDay) => tracked * perDay * r.workDaysPerMonth;
  const mapUsage = {
    js: monthlyCalls(r.mapJsPerUserPerDay),
    roads: monthlyCalls(r.mapRoadsPerUserPerDay),
    search: monthlyCalls(r.mapSearchPerUserPerDay),
    details: monthlyCalls(r.mapDetailsPerUserPerDay),
  };
  const billable = (k) => Math.max(0, mapUsage[k] - (r.mapFree[k] || 0));
  const mapUsd =
    (billable('js') / 1000) * r.mapUsdPer1000 +
    (billable('roads') / 1000) * r.roadsUsdPer1000 +
    (billable('search') / 1000) * r.searchUsdPer1000 +
    (billable('details') / 1000) * r.detailsUsdPer1000;
  const mapLoads = mapUsage.js + mapUsage.roads + mapUsage.search + mapUsage.details;
  const autoMap = tracking ? Math.round(mapUsd * fx) : 0;

  const off = inp.infraOff || {};
  const linode = ovr.linode !== undefined ? ovr.linode : (off.linode ? 0 : autoLinode);
  const linodeBackup = ovr.linodeBackup !== undefined ? ovr.linodeBackup : (off.linodeBackup ? 0 : autoLinodeBackup);
  const db = ovr.db !== undefined ? ovr.db : (off.db ? 0 : autoDb);
  const storage = ovr.storage !== undefined ? ovr.storage : (off.storage ? 0 : autoStorage);
  const map = ovr.map !== undefined ? ovr.map : (off.map ? 0 : autoMap);

  const autoInfra = linode + linodeBackup + db + storage + map;
  const infra = ovr.infra !== undefined ? ovr.infra : autoInfra;
  const autoMarkup = Math.round(infra * (r.markupPct / 100));
  const markup = ovr.markup !== undefined ? ovr.markup : autoMarkup;

  const hrFee = hr ? (r.moduleFee?.hr ?? 2000) : 0;
  const mobileAppFee = mobileApp ? (r.moduleFee?.mobileApp ?? 2500) : 0;
  const jewelLoanFee = jewelLoan ? (r.moduleFee?.jewelLoan ?? 2000) : 0;

  // Itemised one-time fees (used by customer quote + PDF)
  const feeLines = !active ? [] : [
    ['Staff licences (' + users + ' users)', users * r.perUser],
    ['Branch licences (' + branches + ' branches)', branches * r.perBranch],
    ['Customer records (' + clients.toLocaleString('en-IN') + ' customers)', clients * r.perClient],
    ...(backup ? [['Automated server backup', Math.round((r.moduleFee?.backup ?? 500) * backupMult)]] : []),
    ...(tracking ? [['Live tracking module', r.moduleFee?.tracking ?? 1500]] : []),
    ...(mfi ? [['MFI module', r.moduleFee?.mfi ?? 3000]] : []),
    ...(hr ? [['HR module', hrFee]] : []),
    ...(mobileApp ? [['Mobile app', mobileAppFee]] : []),
    ...(jewelLoan ? [['Jewel loan module', jewelLoanFee]] : []),
  ].filter(([, v]) => v > 0);
  const autoFees = feeLines.reduce((a, [, v]) => a + v, 0);
  const fees = ovr.fees !== undefined ? ovr.fees : autoFees;

  const autoMonthly = infra; // recurring = server/infra charge only
  const monthly = ovr.monthly !== undefined ? ovr.monthly : autoMonthly;

  const autoOneTime = markup + fees; // markup + user/branch/client/module fees are one-time
  const oneTime = ovr.oneTime !== undefined ? ovr.oneTime : autoOneTime;

  const autoYearGross = Math.round(monthly * 12);
  const yearGross = ovr.yearGross !== undefined ? ovr.yearGross : autoYearGross;

  // Yearly with 1 month discount (pay 11 months for 12 months service)
  const autoYearly = Math.round(monthly * 11);
  const yearly = ovr.yearly !== undefined ? ovr.yearly : autoYearly;

  const setupFee = ovr.setupFee !== undefined ? ovr.setupFee : active ? r.setupFee : 0;

  // GST (applied on top of every payment)
  const g = (r.gstPct ?? 0) / 100;
  const autoOneTimeBase = oneTime + setupFee;
  const oneTimeBase = ovr.oneTimeBase !== undefined ? ovr.oneTimeBase : autoOneTimeBase;

  const autoGstMonthly = Math.round(monthly * g);
  const gstMonthly = ovr.gstMonthly !== undefined ? ovr.gstMonthly : autoGstMonthly;

  const autoGstYearly = Math.round(yearly * g);
  const gstYearly = ovr.gstYearly !== undefined ? ovr.gstYearly : autoGstYearly;

  const autoGstOneTime = Math.round(oneTimeBase * g);
  const gstOneTime = ovr.gstOneTime !== undefined ? ovr.gstOneTime : autoGstOneTime;

  const gst = {
    monthly: gstMonthly,
    yearly: gstYearly,
    oneTime: gstOneTime,
  };

  const autoMonthlyTotal = monthly + gst.monthly;
  const monthlyTotal = ovr.monthlyTotal !== undefined ? ovr.monthlyTotal : autoMonthlyTotal;

  const autoYearlyTotal = yearly + gst.yearly;
  const yearlyTotal = ovr.yearlyTotal !== undefined ? ovr.yearlyTotal : autoYearlyTotal;

  const autoOneTimeTotal = oneTimeBase + gst.oneTime;
  const oneTimeTotal = ovr.oneTimeTotal !== undefined ? ovr.oneTimeTotal : autoOneTimeTotal;

  const autoProfit = markup + fees;
  const profit = ovr.profit !== undefined ? ovr.profit : autoProfit;

  const backupLabel = !backup
    ? 'Linode backups (Disabled)'
    : backupFreq === 'yearly'
    ? 'Linode backups (Yearly - 1 mo discount)'
    : `Linode backups (${backupFreq.charAt(0).toUpperCase() + backupFreq.slice(1)})`;

  return {
    plan, dbPlan, planUsd, dbUsd, dataGB, storageGB, mapLoads, mapUsage, mapUsd, load, dbLoad, dailyCalls, peakPerMin, moduleCalls,
    lines: [
      ['linode', 'Linode server - ' + plan.name, linode],
      ['linodeBackup', backupLabel, linodeBackup],
      ['db', 'DigitalOcean DB - ' + dbPlan.name, db],
      ['storage', 'Cloud storage (Spaces) ' + storageGB.toFixed(1) + ' GB', storage],
      ['map', 'Google Maps (' + Math.round(mapLoads).toLocaleString() + ' calls/mo, beyond free tier)', map],
    ],
    feeLines, infra, markup, fees, oneTime, oneTimeBase, gst, monthlyTotal, yearlyTotal, oneTimeTotal, monthly, yearGross, yearly,
    setupFee,
    profit,
  };
}
