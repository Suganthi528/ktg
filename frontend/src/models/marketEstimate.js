// Works out what each competitor would charge for a given client size, dynamically scaling with
// users (staff), branches, clients (members/loans), and selected modules.
// First-year cost, INR, excl. GST unless stated.
// Result: { est?, low?, high?, plan, note, conf }
//   conf 'limits' = stated plan limits or tier rules cover this size
//   conf 'flat'   = flat per-branch/per-set model scaled to volume
//   conf 'quote'  = enterprise size requiring quote, estimated from vendor pricing rules
// q = { users, branches, clients, mfi, tracking, hr, mobileApp, jewelLoan }

const L = (n) => 'Rs ' + Math.round(n).toLocaleString('en-IN');

// AMY Fintech microfinance tiers: [name, members, branches, licence, yearly maintenance]
const AMY = [
  ['Basic', 300, 1, 24000, 5000],
  ['Standard', 700, 3, 36000, 8000],
  ['Premium', 1200, 5, 50000, 10000],
  ['Advanced', 2000, 10, 75000, 12000],
  ['Pro Enterprise', Infinity, Infinity, 120000, 15000],
];

const ESTIMATORS = {
  'CloudHouse Technologies': (q) => {
    const branches = Math.max(1, q.branches);
    const rate = branches <= 1 ? 16500 : branches <= 5 ? 16500 : branches <= 10 ? 15000 : branches <= 20 ? 13500 : 12000;
    const est = branches * rate;
    const plan = branches <= 1 ? '1 branch' : branches <= 5 ? 'Up to 5 branches' : branches <= 10 ? 'Up to 10 branches' : branches <= 20 ? 'Up to 20 branches' : 'Custom Enterprise';
    return {
      est,
      plan,
      note: `${branches} branch tier x ${L(rate)}/branch (one-time licence). Gold loan product, unlimited users. AMC Rs 2,000/br/yr from yr 2`,
      conf: branches <= 1 ? 'limits' : 'quote',
    };
  },

  'TaxHint (gold loan software)': (q) => {
    const branches = Math.max(1, q.branches);
    const volumeAddon = q.clients > 1000 ? Math.floor(q.clients / 1000) * 1500 : 0;
    const est = (branches * 5000) + volumeAddon;
    return {
      est,
      plan: `${branches} Branch Setup`,
      note: `"From Rs 5,000" per branch (${branches} branches = ${L(branches * 5000)})${volumeAddon > 0 ? ` + scale addon ${L(volumeAddon)}` : ''}. Gold loan product`,
      conf: 'quote',
    };
  },

  'SB Creation Group (Renu SB Creation)': (q) => {
    const extraBr = Math.max(0, q.branches - 1) * 6000;
    const extraStaff = Math.max(0, q.users - 10) * 400;
    const extraClients = Math.max(0, Math.floor(q.clients / 1000)) * 2000;
    const est = 35000 + extraBr + extraStaff + extraClients;
    return {
      est,
      plan: 'Microfinance edition',
      note: `Base Rs 35,000${extraBr > 0 ? ` + ${q.branches - 1} extra branches x Rs 6,000` : ''}${extraStaff > 0 ? ` + ${q.users - 10} staff x Rs 400` : ''}${extraClients > 0 ? ` + client scale ${L(extraClients)}` : ''}`,
      conf: 'quote',
    };
  },

  'IDSPay': (q) => {
    const est = Math.max(40000, q.branches * 10000 + q.users * 300);
    return {
      est,
      plan: `${q.branches} Branch Cloud MFI`,
      note: `Estimated quote for ${q.branches} branches and ${q.users} users: JLG/SHG, field agent tracking, automated backups`,
      conf: 'quote',
    };
  },

  'Jaguar Software India': (q) => {
    const est = Math.max(45000, q.branches * 12000 + q.users * 350);
    return {
      est,
      plan: `${q.branches} Branch MFI Setup`,
      note: `Estimated quote for ${q.branches} branches and ${q.users} users: native JLG/SHG core banking with offline field collection apps`,
      conf: 'quote',
    };
  },

  'Finsta (Kapil IT Solutions)': (q) => {
    const est = Math.max(60000, q.branches * 14000 + q.users * 400);
    return {
      est,
      plan: 'Custom NBFC Suite',
      note: `Estimated quote for ${q.branches} branches and ${q.users} users: LOS, LMS, and mobile collection apps`,
      conf: 'quote',
    };
  },

  'SquareNow (Kapiital Systems)': (q) => {
    const est = Math.max(50000, Math.round(q.clients * 25 + q.branches * 8000));
    return {
      est,
      plan: 'AUM-Scaled Platform',
      note: `Estimated quote for ${q.clients.toLocaleString('en-IN')} clients and ${q.branches} branches: pricing scales with AUM and loan volume`,
      conf: 'quote',
    };
  },

  'AMY Fintech': (q) => {
    const isNBFC = q.clients > 2000 || q.branches > 10;
    if (isNBFC) {
      const extraClients = Math.max(0, q.clients - 2000);
      const extraBranches = Math.max(0, q.branches - 10);
      let est = 120000 + 15000 + (extraBranches * 5000) + Math.floor(extraClients / 500) * 5000;
      let note = `Pro Enterprise / NBFC Suite: licence Rs 1,20,000 + AMC Rs 15,000/yr${extraBranches > 0 ? ` + ${extraBranches} extra branches x Rs 5,000` : ''}${extraClients > 0 ? ` + ${extraClients.toLocaleString('en-IN')} clients scaling` : ''}`;
      if (q.mobileApp) { est += 15000; note += ' + staff app Rs 15,000'; }
      return { est, plan: 'Pro Enterprise / NBFC', note, conf: 'limits' };
    }
    const t = AMY.find((x) => q.clients <= x[1] && q.branches <= x[2]) || AMY[AMY.length - 1];
    let est = t[3] + t[4];
    let note = `${t[0]}: licence ${L(t[3])} + maintenance ${L(t[4])}/yr (up to ${t[1]} members, ${t[2]} br)`;
    if (q.mobileApp && t[0] === 'Basic') {
      est += 10000;
      note += ' + staff app add-on Rs 10,000';
    }
    return { est, plan: t[0], note, conf: 'limits' };
  },

  'Vector nidhi software': (q) => {
    const addon = q.mobileApp || q.hr;
    const extraBranches = Math.max(0, q.branches - 1) * 1000;
    const monthly = 2000 + (addon ? 3000 : 0) + extraBranches;
    const est = monthly * 12;
    return {
      est,
      plan: addon ? 'Basic + Add-on modules' : 'Basic modules',
      note: `${L(monthly)}/month x 12 (Rs 2,000 base${addon ? ' + Rs 3,000 apps/payroll' : ''}${extraBranches > 0 ? ` + ${q.branches - 1} extra branches x Rs 1,000/mo` : ''})`,
      conf: q.branches <= 1 ? 'flat' : 'quote',
    };
  },

  'CK Tech solutions': (q) => {
    if (q.users <= 1 && q.branches <= 1) {
      return { est: 10000 + 6000, plan: 'Startup', note: 'Rs 10,000 one-time + Rs 6,000/yr (1 branch, 1 user)', conf: 'limits' };
    }
    const extraBr = Math.max(0, q.branches - 5) * 2000;
    const extraUsers = Math.max(0, q.users - 50) * 350;
    const app = q.mobileApp ? 10000 + 5000 : 0;
    const base = q.users > 50 || q.branches > 5 ? 55000 + 20000 : 30000 + 12000;
    const est = base + extraBr + extraUsers + app;
    return {
      est,
      plan: q.users > 50 || q.branches > 5 ? 'Elite / Enterprise' : 'Professional',
      note: `Elite/Enterprise base ${L(base)}${extraBr > 0 ? ` + ${q.branches - 5} extra branches x Rs 2,000` : ''}${extraUsers > 0 ? ` + ${q.users - 50} users x Rs 350` : ''}${app > 0 ? ' + app Rs 15,000' : ''}`,
      conf: q.branches > 5 || q.users > 50 ? 'quote' : 'limits',
    };
  },

  'Hubco': (q) => {
    const app = q.mobileApp ? 35000 : 0;
    const extraBranches = Math.max(0, q.branches - 1) * 5000;
    const clientAddon = q.clients > 1000 ? Math.floor(q.clients / 1000) * 2000 : 0;
    const est = 20000 + extraBranches + clientAddon + app;
    return {
      est,
      plan: q.branches > 1 ? 'Multi-branch' : 'Single plan',
      note: `Rs 20,000 base${extraBranches > 0 ? ` + ${q.branches - 1} extra branches x Rs 5,000` : ''}${clientAddon > 0 ? ` + client volume ${L(clientAddon)}` : ''}${app ? ' + Android app Rs 35,000' : ''}`,
      conf: q.branches <= 1 && q.clients <= 1000 ? 'flat' : 'quote',
    };
  },

  'Ecsoft pvt.ltd': (q) => {
    const branches = Math.max(1, q.branches);
    const userBlocks = Math.max(1, Math.ceil(q.users / 500));
    const est = 5000 * branches * userBlocks;
    return {
      est,
      plan: `${branches} Branch${branches > 1 ? 'es' : ''} licence`,
      note: `Rs 5,000/yr per branch installation (${branches} branch${branches > 1 ? 'es' : ''}, ${userBlocks * 500} user cap)`,
      conf: branches <= 1 && q.users <= 500 ? 'flat' : 'quote',
    };
  },

  'Genuine IT solution': (q) => {
    const branches = Math.max(1, q.branches);
    const userBlocks = Math.max(1, Math.ceil(q.users / 500));
    const est = 5000 * branches * userBlocks;
    return {
      est,
      plan: `${branches} Branch${branches > 1 ? 'es' : ''} licence`,
      note: `Rs 5,000/yr per branch installation (${branches} branch${branches > 1 ? 'es' : ''}, ${userBlocks * 500} user cap)`,
      conf: branches <= 1 && q.users <= 500 ? 'flat' : 'quote',
    };
  },

  'Zetu solutions': (q) => {
    const extraBranches = Math.max(0, q.branches - 1) * 12000;
    const est = 64900 + extraBranches;
    return {
      est,
      plan: q.branches > 1 ? `${q.branches} Branches` : 'Single unit',
      note: `Rs 64,900 base listing${extraBranches > 0 ? ` + ${q.branches - 1} branch deployments x Rs 12,000` : ''}`,
      conf: q.branches <= 1 ? 'flat' : 'quote',
    };
  },

  'Green Apps solutions': (q) => {
    const extraBranches = Math.max(0, q.branches - 1) * 12000;
    const est = 64900 + extraBranches;
    return {
      est,
      plan: q.branches > 1 ? `${q.branches} Branches` : 'Single unit',
      note: `Rs 64,900 base listing${extraBranches > 0 ? ` + ${q.branches - 1} branch deployments x Rs 12,000` : ''}`,
      conf: q.branches <= 1 ? 'flat' : 'quote',
    };
  },

  'Websoftex': (q) => {
    const branches = Math.max(1, q.branches);
    const low = branches * 10000;
    const high = Math.max(60000, branches * 12000);
    return {
      low,
      high,
      plan: `${branches} Branch${branches > 1 ? 'es' : ''} (${branches} sets)`,
      note: `${branches} branch set${branches > 1 ? 's' : ''}: Rs 10,000/set (TradeIndia) up to Rs ${high.toLocaleString('en-IN')} (IndiaMART multi-branch)`,
      conf: 'flat',
    };
  },

  'Genius Technology': (q) => {
    const scaleFactor = Math.min(1, (q.users / 100) * 0.35 + (q.branches / 8) * 0.45 + (q.clients / 5000) * 0.2);
    const est = Math.round(40000 + scaleFactor * (170000 - 40000));
    return {
      est,
      plan: scaleFactor < 0.3 ? 'Starter' : scaleFactor < 0.7 ? 'Growth' : 'Enterprise',
      note: `Published range Rs 40,000 - 1,70,000; scaled to ${L(est)} for ${q.users} users, ${q.branches} branches and ${q.clients.toLocaleString('en-IN')} clients`,
      conf: 'quote',
    };
  },

  'Softdew Tech': (q) => {
    const userPacks = Math.max(1, Math.ceil(q.users / 10));
    const branchMultiplier = q.branches > 1 ? Math.max(1, Math.ceil(q.branches / 2)) : 1;
    const packs = Math.max(userPacks, branchMultiplier);
    const est = packs * 9500;
    return {
      est,
      plan: `${packs * 10} Users (${packs} packs)`,
      note: `Rs 9,500/yr per 10 users (${q.users} users across ${q.branches} branches = ${packs} license packs)`,
      conf: q.users <= 10 && q.branches <= 1 ? 'limits' : 'quote',
    };
  },

  'Best software enterprise': (q) => {
    if (q.users <= 1 && q.branches <= 1) {
      return { est: 8000, plan: 'Starter', note: 'Starter Rs 8,000 (single user)', conf: 'limits' };
    }
    if (q.users <= 25 && q.branches <= 2) {
      return { est: 90000, plan: 'Professional', note: 'Professional Rs 90,000 (up to 25 users, 2 branches)', conf: 'limits' };
    }
    const extraUsers = Math.max(0, q.users - 100) * 300;
    const extraBranches = Math.max(0, q.branches - 5) * 5000;
    const est = 220000 + extraUsers + extraBranches;
    return {
      est,
      plan: 'Enterprise',
      note: `Enterprise Rs 2,20,000 base${extraUsers > 0 ? ` + ${q.users - 100} extra users x Rs 300` : ''}${extraBranches > 0 ? ` + ${q.branches - 5} extra branches x Rs 5,000` : ''}`,
      conf: 'quote',
    };
  },

  'NK solutions': (q) => {
    const extraBranches = Math.max(0, q.branches - 1) * 8000;
    const est = 60000 + extraBranches;
    return {
      est,
      plan: q.branches > 1 ? `${q.branches} Branches` : 'Single Licence',
      note: `Rs 60,000 1-year licence${extraBranches > 0 ? ` + ${q.branches - 1} extra branch syncs x Rs 8,000` : ''}`,
      conf: q.branches <= 1 ? 'flat' : 'quote',
    };
  },

  'Varun info solutions': (q) => {
    const blocks = Math.max(1, Math.ceil(q.users / 200));
    const extraBranches = Math.max(0, q.branches - 2) * 8000;
    const est = (blocks * 95000) + extraBranches;
    return {
      est,
      plan: `${blocks * 200} Users tier`,
      note: `Rs 95,000 per 200 users (${blocks} block${blocks > 1 ? 's' : ''} for ${q.users} users)${extraBranches > 0 ? ` + multi-branch sync ${L(extraBranches)}` : ''}`,
      conf: q.users <= 200 && q.branches <= 2 ? 'limits' : 'quote',
    };
  },

  'ERP software India': (q) => {
    const branches = Math.max(1, q.branches);
    let est = 51000;
    let plan = 'Standard';
    if (branches > 4 || q.users > 30) {
      est = 70000 + Math.max(0, branches - 8) * 4000;
      plan = 'Premium';
    } else if (branches > 1 || q.users > 10) {
      est = 60000;
      plan = 'Advance';
    }
    return {
      est,
      plan,
      note: `${plan} edition: Rs ${est.toLocaleString('en-IN')}${branches > 8 ? ` (incl. ${branches - 8} extra branches)` : ''}; unlimited logins`,
      conf: 'flat',
    };
  },

  'Habile technologies': (q) => {
    let monthlyLow = 25000;
    let monthlyHigh = 75000;
    let setup = 100000;
    if (q.branches > 5 || q.users > 50 || q.clients > 2000) {
      monthlyLow = 100000;
      monthlyHigh = 250000;
      setup = 500000;
    }
    const low = monthlyLow * 12 + setup;
    const high = monthlyHigh * 12 + setup * 2;
    return {
      low,
      high,
      plan: q.branches > 5 || q.users > 50 ? 'Growing Lender' : 'Early-stage Lender',
      note: `Guide: ${L(monthlyLow)} - ${L(monthlyHigh)}/mo + ${L(setup)} setup for ${q.users} users, ${q.branches} branches`,
      conf: 'quote',
    };
  },

  'Microfinsoft': (q) => {
    const est = Math.max(35000, q.branches * 8000 + q.users * 250);
    return {
      est,
      plan: `${q.branches} Branch Setup`,
      note: `Estimated quote for ${q.branches} branches and ${q.users} users (pricing page blocked automated access)`,
      conf: 'quote',
    };
  },

  'Aspire software and services': (q) => {
    const est = Math.max(30000, q.branches * 6000 + q.users * 200);
    return {
      est,
      plan: `${q.branches} Branch Package`,
      note: `Estimated quote for ${q.branches} branches and ${q.users} users (Vexil Infotech listing)`,
      conf: 'quote',
    };
  },

  'Fly fusion software': (q) => {
    const est = Math.max(25000, q.branches * 5000);
    return {
      est,
      plan: `${q.branches} Branch Nidhi`,
      note: `Estimated quote for ${q.branches} branches based on IndiaMART Nidhi directory range`,
      conf: 'quote',
    };
  },

  'HRBluSky': (q) => {
    const monthly = 1000 + q.users * 10;
    return {
      est: monthly * 12,
      plan: 'Cloud HR + GPS Tracker',
      note: `Rs 1,000/mo base + Rs 10/user/mo (${q.users} users = Rs ${monthly.toLocaleString('en-IN')}/mo x 12). Dedicated GPS tracking & HRMS`,
      conf: 'limits',
    };
  },

  'lendstack': (q) => {
    const branches = Math.max(1, q.branches);
    const branchPacks = Math.ceil(branches / 2);
    let monthly = 299;
    let tierName = 'Professional';
    if (q.clients > 1000 || q.users > 10 || branches > 2) {
      monthly = 999 * branchPacks;
      tierName = 'Premium Multi-branch';
    } else if (q.clients > 200 || q.users > 3 || branches > 1) {
      monthly = 599 * branchPacks;
      tierName = 'Power';
    }
    const est = monthly * 12;
    return {
      est,
      plan: tierName,
      note: `Rs ${monthly.toLocaleString('en-IN')}/mo x 12 (${tierName} tier for ${q.users} users, ${branches} branches and ${q.clients.toLocaleString('en-IN')} loans)`,
      conf: 'limits',
    };
  },
};

export function estimateFor(name, q) {
  const f = ESTIMATORS[name];
  return f ? f(q) : { plan: 'Unknown', note: '', conf: 'quote' };
}
