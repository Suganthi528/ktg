// Works out what each competitor would charge for a given client size, using ONLY the rules and prices
// printed on their pages (read 21 Nov 2026). First-year cost, INR, excl. GST unless stated.
// Result: { est?, low?, high?, plan, note, conf }
//   conf 'limits' = their stated plan limits cover this size
//   conf 'flat'   = one listed price, not size-based (the real price for a big client may be higher)
//   conf 'quote'  = their page says size needs a quote / price is a range
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
  'CloudHouse Technologies': (q) => ({
    est: 16500,
    plan: q.branches <= 1 ? '1 branch' : q.branches <= 20 ? 'Branch tier' : 'Custom',
    note: q.branches <= 1
      ? 'Rs 16,500 + GST one-time for 1 branch, unlimited users; AMC Rs 2,000 + GST/yr from year two. Gold loan product only'
      : q.branches <= 20
        ? `Only the 1-branch price (Rs 16,500 + GST) is shown; the up-to-${q.branches <= 5 ? 5 : q.branches <= 10 ? 10 : 20}-branch tier price is on request. Gold loan product only`
        : 'Above 20 branches the page says custom quote (1-branch price Rs 16,500 shown). Gold loan product only',
    conf: q.branches <= 1 ? 'limits' : 'quote',
  }),
  'TaxHint (gold loan software)': () => ({ est: 5000, plan: 'From price', note: '"From Rs 5,000"; final price depends on scale and modules. Gold loan product, unlimited users', conf: 'quote' }),
  'SB Creation Group (Renu SB Creation)': () => ({ est: 35000, plan: 'Microfinance edition', note: 'Starts from Rs 35,000, depending on branches, agents and customers', conf: 'quote' }),
  'IDSPay': () => ({ plan: 'Quote', note: 'Quote only; no figures on the page', conf: 'quote' }),
  'Jaguar Software India': () => ({ plan: 'Quote', note: 'Pricing not published; demo only', conf: 'quote' }),
  'Finsta (Kapil IT Solutions)': () => ({ plan: 'Quote', note: 'Customised pricing after a needs assessment (branches, loan volume, modules)', conf: 'quote' }),
  'SquareNow (Kapiital Systems)': () => ({
    plan: 'Quote',
    note: 'No price published. The site says entry pricing is sized for small books and scales with AUM (loan book size)',
    conf: 'quote',
  }),
  'AMY Fintech': (q) => {
    const t = AMY.find((x) => q.clients <= x[1] && q.branches <= x[2]) || AMY[AMY.length - 1];
    let est = t[3] + t[4];
    let note = `${t[0]}: licence ${L(t[3])} + maintenance ${L(t[4])}/yr`;
    // Staff app arrives with Standard; Basic needs it as an add-on (Rs 10,000 - 25,000, low end used)
    if (q.mobileApp && t[0] === 'Basic') {
      est += 10000;
      note += ' + staff app add-on Rs 10,000';
    }
    return { est, plan: t[0], note, conf: 'limits' };
  },

  'Vector nidhi software': (q) => {
    const addon = q.mobileApp || q.hr;
    const monthly = 2000 + (addon ? 3000 : 0);
    return {
      est: monthly * 12,
      plan: addon ? 'Basic + add-on modules' : 'Basic modules',
      note: `${L(monthly)}/month x 12 (add-on package covers apps and payroll)`,
      conf: 'flat',
    };
  },

  'CK Tech solutions': (q) => {
    // Pawn-broking product. Startup: 1 branch, 1 user. Professional: 1 branch incl. Elite: 5 branches incl.
    if (q.users <= 1 && q.branches <= 1) {
      return { est: 10000 + 6000, plan: 'Startup', note: 'Rs 10,000 one-time + Rs 6,000/yr (1 branch, 1 user, no mobile app)', conf: 'limits' };
    }
    const extra = (inc) => Math.max(0, q.branches - inc) * 2000;
    const app = q.mobileApp ? 10000 + 5000 : 0;
    const pro = 30000 + 12000 + extra(1) + app;
    const elite = 55000 + 20000 + extra(5);
    const useElite = elite < pro;
    return {
      est: useElite ? elite : pro,
      plan: useElite ? 'Elite' : 'Professional',
      note: useElite
        ? `Elite Rs 55,000 + Rs 20,000/yr (5 branches, app included)${q.branches > 5 ? ` + ${q.branches - 5} extra branches x Rs 2,000` : ''}`
        : `Professional Rs 30,000 + Rs 12,000/yr${q.branches > 1 ? ` + ${q.branches - 1} extra branches x Rs 2,000` : ''}${q.mobileApp ? ' + app Rs 10,000 + Rs 5,000/yr' : ''}`,
      conf: q.branches > 5 || q.users > 50 ? 'quote' : 'limits',
    };
  },

  'Hubco': (q) => {
    const app = q.mobileApp ? 35000 : 0;
    return {
      est: 20000 + app,
      plan: 'Single plan',
      note: `Rs 20,000/yr${app ? ' + Android app Rs 35,000' : ''}; other modules not priced; user/branch/client limits not stated`,
      conf: 'flat',
    };
  },

  'Ecsoft pvt.ltd': () => ({ est: 5000, plan: 'Listed price', note: 'The listing shows one price (Rs 5,000, 1-year licence, "above 500 users"). It does not change with staff, branches or clients, so ask the supplier for a quote at this size', conf: 'flat' }),
  'Genuine IT solution': () => ({ est: 5000, plan: 'Listed price', note: 'The listing shows one price (Rs 5,000, 1-year licence, "above 500 users"). It does not change with staff, branches or clients, so ask the supplier for a quote at this size', conf: 'flat' }),
  'Zetu solutions': () => ({ est: 64900, plan: 'Listing', note: 'Rs 64,900 one price (ADL Techno listing); no limits stated', conf: 'flat' }),
  'Green Apps solutions': () => ({ est: 64900, plan: 'Listing', note: 'Rs 64,900 one price (ADL Techno listing); no limits stated', conf: 'flat' }),
  'Websoftex': () => ({ low: 10000, high: 60000, plan: 'Two listings', note: 'Rs 10,000 per set (TradeIndia) or Rs 60,000 (IndiaMART listing); no limits stated', conf: 'flat' }),

  'Genius Technology': () => ({
    low: 40000,
    high: 170000,
    plan: 'Custom',
    note: 'Page gives only a range (Rs 40,000 - 1,70,000) depending on requirements',
    conf: 'quote',
  }),

  'Softdew Tech': (q) => ({
    est: 9500,
    plan: 'Annual licence',
    note: q.users <= 10 ? 'Rs 9,500/yr covers up to 10 users' : `Rs 9,500/yr covers only 10 users; ${q.users} users needs a quote`,
    conf: q.users <= 10 ? 'limits' : 'quote',
  }),

  'Best software enterprise': (q) =>
    q.users <= 1
      ? { est: 8000, plan: 'Starter', note: 'Starter Rs 8,000 (single user)', conf: 'limits' }
      : { low: 90000, high: 220000, plan: 'Professional / Enterprise', note: 'Multi-user: Professional Rs 90,000, Enterprise Rs 2,20,000; page does not say which size fits which tier', conf: 'quote' },

  'NK solutions': () => ({ est: 60000, plan: 'Listing', note: 'Rs 60,000 for a 1-year multi-user licence; user count not stated', conf: 'flat' }),

  'Varun info solutions': (q) => {
    const inBand = q.users >= 51 && q.users <= 200;
    return {
      est: 95000,
      plan: 'Listing',
      note: inBand ? 'Rs 95,000 covers 51 - 200 users' : `Rs 95,000 is the price for 51 - 200 users; ${q.users} users is outside that band, needs a quote`,
      conf: inBand ? 'limits' : 'quote',
    };
  },

  'ERP software India': () => ({
    low: 51000,
    high: 70000,
    plan: 'Standard / Advance / Premium',
    note: 'Rs 51,000 / 60,000 / 70,000; which features sit in which plan could not be read; unlimited users',
    conf: 'flat',
  }),

  'Habile technologies': () => ({
    low: 25000 * 12,
    high: 400000 * 12,
    plan: 'Guide only',
    note: 'Article: early-stage lenders Rs 25,000 - 1 lakh/month, growing lenders Rs 1 - 4 lakh/month, plus Rs 1 - 15 lakh setup. It gives no size thresholds, so this is not size-driven',
    conf: 'quote',
  }),

  'Microfinsoft': () => ({ plan: 'Unknown', note: 'Pricing page blocked automated access', conf: 'quote' }),
  'Aspire software and services': () => ({ plan: 'Quote', note: 'No price shown on the listing', conf: 'quote' }),
  'Fly fusion software': () => ({ plan: 'Unknown', note: 'Not on the directory page that was read', conf: 'quote' }),
};

export function estimateFor(name, q) {
  const f = ESTIMATORS[name];
  return f ? f(q) : { plan: 'Unknown', note: '', conf: 'quote' };
}
