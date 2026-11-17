// All money in INR. Defaults are editable in the UI (saved in localStorage).
export const DEFAULT_RATES = {
  usdToInr: 85,
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
  moduleFee: { backup: 500, tracking: 1500, mfi: 3000 },
  setupFee: 10000,
  yearDiscountPct: 10,
  gstPct: 18, // GST on software/hosting services (India)
};

const pick = (list, load) => list.find((p) => p.cap >= load) || list[list.length - 1];

export function calculate(inp, r) {
  const fx = r.usdToInr;
  const users = Math.max(0, Number(inp.users) || 0);
  const branches = Math.max(0, Number(inp.branches) || 0);
  const clients = Math.max(0, Number(inp.clients) || 0);
  const trackedUsers = Math.max(0, Number(inp.trackedUsers) || 0);
  const { mode, backup, tracking, mfi } = inp;
  const tracked = tracking ? Math.min(trackedUsers, users) : 0;

  const load = users + clients / 50 + branches * 2 + tracked * 3 + (mfi ? users * 0.5 : 0);
  const plan = pick(r.plans, load);
  const dbPlan = pick(r.dbPlans, clients / 10 + users * 2 + tracked * 20);

  const share = mode === 'shared' ? 1 / r.sharedTenants : 1;
  const linode = plan.usd * fx * share;
  const linodeBackup = backup ? plan.usd * (r.linodeBackupPct / 100) * fx * share : 0;
  const db = dbPlan.usd * fx * share;

  const dataGB = (clients * r.mbPerClient) / 1024 + tracked * 0.3;
  const storageGB = backup ? dataGB * 3 : dataGB; // 3 retained backup copies
  const extra = Math.max(0, storageGB - 250);
  const storage = (r.spacesUsdPer250GB + extra * r.spacesExtraUsdPerGB) * fx * share;

  const mapLoads = tracked * r.mapLoadsPerUserPerDay * r.workDaysPerMonth;
  const map = (mapLoads / 1000) * r.mapUsdPer1000 * fx;

  const off = inp.infraOff || {};
  const raw = { linode, linodeBackup, db, storage, map };
  const on = (k) => (off[k] ? 0 : raw[k]);
  const infra = on('linode') + on('linodeBackup') + on('db') + on('storage') + on('map');
  const markup = infra * (r.markupPct / 100);
  const fees =
    users * r.perUser + branches * r.perBranch + clients * r.perClient +
    (backup ? r.moduleFee.backup : 0) + (tracking ? r.moduleFee.tracking : 0) + (mfi ? r.moduleFee.mfi : 0);
  const monthly = infra; // recurring = server/infra charge only
  const oneTime = markup + fees; // markup + user/branch/client/module fees are one-time
  const yearGross = monthly * 12;
  const yearly = yearGross * (1 - r.yearDiscountPct / 100);

  // GST (applied on top of every payment)
  const g = (r.gstPct ?? 0) / 100;
  const oneTimeBase = oneTime + r.setupFee;
  const gst = {
    monthly: monthly * g,
    yearly: yearly * g,
    oneTime: oneTimeBase * g,
  };
  const monthlyTotal = monthly + gst.monthly;
  const yearlyTotal = yearly + gst.yearly;
  const oneTimeTotal = oneTimeBase + gst.oneTime;

  return {
    plan, dbPlan, dataGB, storageGB, mapLoads, load,
    lines: [
      ['linode', 'Linode server - ' + plan.name, linode],
      ['linodeBackup', 'Linode backups', linodeBackup],
      ['db', 'DigitalOcean DB - ' + dbPlan.name, db],
      ['storage', 'Cloud storage (Spaces) ' + storageGB.toFixed(1) + ' GB', storage],
      ['map', 'Map charge (' + Math.round(mapLoads).toLocaleString() + ' loads)', map],
    ],
    infra, markup, fees, oneTime, oneTimeBase, gst, monthlyTotal, yearlyTotal, oneTimeTotal, monthly, yearGross, yearly,
    profit: markup + fees,
  };
}
