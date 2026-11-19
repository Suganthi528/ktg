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
  // Map charge (Google Maps style)
  mapUsdPer1000: 7,
  mapLoadsPerUserPerDay: 40,
  workDaysPerMonth: 26,
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

export function calculate(inp, r) {
  const fx = r.usdToInr;
  const users = Math.max(0, Number(inp.users) || 0);
  const branches = Math.max(0, Number(inp.branches) || 0);
  const clients = Math.max(0, Number(inp.clients) || 0);
  const trackedUsers = Math.max(
    0,
    inp.trackedUsers !== undefined && inp.trackedUsers !== '' ? Number(inp.trackedUsers) : users
  );
  const { mode, backup, tracking, mfi, hr, mobileApp, jewelLoan, backupFreq = 'daily' } = inp;
  const tracked = tracking ? Math.min(trackedUsers, users) : 0;
  const ovr = inp.overrides || {};

  const load =
    users +
    clients / 50 +
    branches * 2 +
    tracked * 3 +
    (mfi ? users * 0.5 : 0) +
    (hr ? users * 0.3 : 0) +
    (mobileApp ? users * 0.5 : 0) +
    (jewelLoan ? users * 0.3 : 0);
  const plan = pick(r.plans, load);
  const dbPlan = pick(
    r.dbPlans,
    clients / 10 + users * 2 + tracked * 20 + (jewelLoan ? 20 : 0) + (mobileApp ? 50 : 0)
  );

  const share = mode === 'shared' ? 1 / r.sharedTenants : 1;
  const autoLinode = Math.round(plan.usd * fx * share);

  // Backup frequency multiplier: yearly gets 1 month discount (11/12)
  let backupMult = 1;
  if (backupFreq === 'weekly') backupMult = 0.85;
  else if (backupFreq === 'monthly') backupMult = 0.7;
  else if (backupFreq === 'yearly') backupMult = 11 / 12;

  const autoLinodeBackup = backup
    ? Math.round(plan.usd * (r.linodeBackupPct / 100) * fx * share * backupMult)
    : 0;
  const autoDb = Math.round(dbPlan.usd * fx * share);

  const storageMult = backupFreq === 'monthly' ? 1.5 : backupFreq === 'weekly' ? 2 : 3;
  const dataGB = (clients * r.mbPerClient) / 1024 + tracked * 0.3;
  const storageGB = backup ? dataGB * storageMult : dataGB; // retained backup copies
  const extra = Math.max(0, storageGB - 250);
  const autoStorage = Math.round((r.spacesUsdPer250GB + extra * r.spacesExtraUsdPerGB) * fx * share);

  const mapLoads = tracked * r.mapLoadsPerUserPerDay * r.workDaysPerMonth;
  const autoMap = Math.round((mapLoads / 1000) * r.mapUsdPer1000 * fx);

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

  const autoFees =
    users * r.perUser +
    branches * r.perBranch +
    clients * r.perClient +
    (backup ? Math.round((r.moduleFee?.backup ?? 500) * backupMult) : 0) +
    (tracking ? (r.moduleFee?.tracking ?? 1500) : 0) +
    (mfi ? (r.moduleFee?.mfi ?? 3000) : 0) +
    hrFee +
    mobileAppFee +
    jewelLoanFee;
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

  const setupFee = ovr.setupFee !== undefined ? ovr.setupFee : r.setupFee;

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
    plan, dbPlan, dataGB, storageGB, mapLoads, load,
    lines: [
      ['linode', 'Linode server - ' + plan.name, linode],
      ['linodeBackup', backupLabel, linodeBackup],
      ['db', 'DigitalOcean DB - ' + dbPlan.name, db],
      ['storage', 'Cloud storage (Spaces) ' + storageGB.toFixed(1) + ' GB', storage],
      ['map', 'Map charge (' + Math.round(mapLoads).toLocaleString() + ' loads)', map],
    ],
    infra, markup, fees, oneTime, oneTimeBase, gst, monthlyTotal, yearlyTotal, oneTimeTotal, monthly, yearGross, yearly,
    setupFee,
    profit,
  };
}
