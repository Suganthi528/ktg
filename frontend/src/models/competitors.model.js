// Competitor pricing pages from server_price_calculation.xlsx, plus the pricing each page showed
// when read on 21 Nov 2026. Amounts are INR, exactly as published (mostly excl. GST).
// entry/top = indicative first-year cost of the cheapest / dearest published plan (for the chart).
// models: LIC = one-time licence + yearly maintenance | SUB = monthly/annual subscription |
//         YEAR = yearly licence (marketplace) | RANGE = price range only | NONE = no price visible
const RAW = [
  {
    name: 'Microfinsoft', url: 'https://microfinsoft.com/web/pricing.php', model: 'NONE',
    headline: 'Page blocked automated access (HTTP 403)', entry: null, top: null,
    notes: ['Pricing could not be read - open the link in a browser to check it.'],
  },
  {
    name: 'AMY Fintech', url: 'https://amyfintech.com/pricing/', model: 'LIC',
    headline: 'Lifetime licence Rs 24,000 - 1,20,000 + yearly maintenance Rs 5,000 - 15,000', entry: 29000, top: 235000,
    notes: [
      'Microfinance plans (licence + maintenance/yr): Basic 24,000 + 5,000 (300 members, 1 branch); Standard 36,000 + 8,000 (700 members, 3 branches); Premium 50,000 + 10,000 (1,200 members, 5 branches); Advanced 75,000 + 12,000 (2,000 members, 10 branches); Pro Enterprise 1,20,000 + 15,000 (unlimited members and branches).',
      'NBFC & Nidhi plans: Starter 45,000 + 8,000 up to Enterprise Suite 2,10,000 + 25,000.',
      'Priced by members and branches. Maintenance covers domain, hosting server, general maintenance and backups.',
      'Add-ons: customer app 15,000 - 30,000; staff collection app 10,000 - 25,000; SMS pack 25,000 SMS for 8,000; Aadhaar eKYC Rs 6 each; CIBIL report Rs 50 - 75 each; payment gateway setup 3,000 - 10,000.',
    ],
  },
  {
    name: 'Vector nidhi software', url: 'https://vectornidhisoftware.com/nidhi-software-price/', model: 'SUB',
    headline: 'From Rs 2,000 / month (basic) + Rs 3,000 / month (add-on modules)', entry: 24000, top: 60000,
    notes: [
      'Basic modules Rs 2,000/month: admin with maker-checker, members, deposits, loans, day-end, reports.',
      'Add-on modules Rs 3,000/month: customer app, web portal, collection app, fingerprint login, passbook printing, payroll.',
      'Page does not say whether the add-on price stacks on the base. No user/branch limits stated.',
    ],
  },
  {
    name: 'CK Tech solutions', url: 'https://www.cktechindia.com/pawn-broking-software/pricing', model: 'LIC',
    headline: 'One-time Rs 10,000 - 55,000 + yearly support Rs 6,000 - 20,000 (incl. GST)', entry: 16000, top: 75000,
    notes: [
      'Pawn-broking software. Startup 10,000 + 6,000/yr (1 branch, 1 user); Professional 30,000 + 12,000/yr; Elite 55,000 + 20,000/yr (5+ branches); Enterprise custom.',
      'Extra branch Rs 2,000/year; customer mobile app 10,000 + about 5,000/year.',
      'Free 2-month trial and free live demo. States "no hidden" setup or maintenance fees.',
    ],
  },
  {
    name: 'Hubco', url: 'https://www.hubco.in/microfinance-software', model: 'SUB',
    headline: 'Rs 2,000 / month or Rs 20,000 / year (excl. GST) + paid add-ons', entry: 20000, top: null,
    notes: [
      'One plan: loan origination, loan management, SHG management, reporting, credit risk. No user/branch limits stated.',
      'Add-ons: payment gateway 20,000; Android app for members and staff 35,000; internet banking 15,000; credit agency service 25,000; website 15,000; customisation from 5,000.',
    ],
  },
  {
    name: 'Ecsoft pvt.ltd', url: 'https://www.indiamart.com/proddetail/micro-finance-software-27068753312.html', model: 'YEAR',
    headline: 'Rs 5,000 (1-year licence, excl. taxes) - listing seller is Genuine IT Solution', entry: 5000, top: null, sameAs: 'Genuine IT solution',
    notes: ['Ecsoft is not named on this listing. Cloud, "above 500 users", loan origination, Android field app, installation service, free demo.'],
  },
  {
    name: 'Genuine IT solution', url: 'https://www.indiamart.com/proddetail/micro-finance-software-27068753312.html', model: 'YEAR',
    headline: 'Rs 5,000 (1-year licence, excl. taxes)', entry: 5000, top: null,
    notes: ['Cloud, "above 500 users", loan origination, Android field app, installation included, business-hours support, free demo.'],
  },
  {
    name: 'Zetu solutions', url: 'https://www.indiamart.com/proddetail/microfinance-management-software-26447589648.html', model: 'YEAR',
    headline: 'Rs 64,900 (excl. taxes) - listing seller is ADL Techno', entry: 64900, top: null, sameAs: 'Green Apps solutions',
    notes: ['Zetu is not named on this listing. Unit/period not stated. Field recovery tracking, inbuilt SMS, accounting, Windows + Android.'],
  },
  {
    name: 'Aspire software and services', url: 'https://www.tradeindia.com/products/micro-finance-software-with-advance-feature-5206748.html', model: 'NONE',
    headline: 'No price shown - listing seller is Vexil Infotech ("Get Latest Price")', entry: null, top: null,
    notes: ['Aspire only appears as the seller of an unrelated accounting product. Features: Aadhaar verification, geo tagging, payroll, CRM, mobile access.'],
  },
  {
    name: 'Websoftex', url: 'https://www.tradeindia.com/products/micro-finance-software-6182920.html', model: 'YEAR',
    headline: 'Rs 10,000 per set (TradeIndia) or Rs 60,000 (IndiaMART listing)', entry: 10000, top: 60000,
    notes: [
      'TradeIndia listing: Rs 10,000 per set, fixed price, 0% GST shown. One-time vs recurring not stated. Web and mobile, online/offline, fund management, branch operations. Sample available.',
      'A second Websoftex IndiaMART listing (Bengaluru) is Rs 60,000 excl. taxes: multi-user, online, Android agent + customer apps, HR module, gold loan as a loan type, CIBIL API. Model and period not stated.',
    ],
  },
  {
    name: 'Genius Technology', url: 'https://www.geniustechnoindia.com/microfinance-software', model: 'RANGE',
    headline: 'Rs 40,000 - 1,70,000 (depends on requirements)', entry: 40000, top: 170000,
    notes: ['Single range, no plan table. Cloud (SaaS) or on-premise. Android app, SMS, UPI, Aadhaar, payment gateway are priced add-ons (no figures). Demo on request.'],
  },
  {
    name: 'Softdew Tech', url: 'https://www.indiamart.com/proddetail/microfinance-loan-management-software-lending-management-software-nbfc-2856408316448.html', model: 'YEAR',
    headline: 'Rs 9,500 per year (annual licence, excl. taxes)', entry: 9500, top: null,
    notes: ['Cloud, up to 10 users, multi-branch (request/approval/disbursement), Android field app and customer app, UPI/NACH collection.'],
  },
  {
    name: 'Green Apps solutions', url: 'https://www.indiamart.com/proddetail/microfinance-management-software-26447589648.html', model: 'YEAR',
    headline: 'Rs 64,900 (excl. taxes) - listing seller is ADL Techno', entry: 64900, top: null,
    notes: ['Green Apps is not named on this listing. Same product page as Zetu solutions.'],
  },
  {
    name: 'Best software enterprise', url: 'https://www.bestsoftware.co.in/productDetails/nelito-fincraft', model: 'SUB',
    headline: 'Nelito FinCraft tiers: Rs 8,000 / 90,000 / 2,20,000 (period not stated)', entry: 8000, top: 220000,
    notes: [
      'Starter 8,000: core modules, single user, mobile app, email help. Professional 90,000: multi-user roles, analytics, phone support. Enterprise 2,20,000: SLA manager, unlimited APIs, ERP connectors.',
      'Free evaluation trial mentioned.',
    ],
  },
  {
    name: 'NK solutions', url: 'https://www.indiamart.com/proddetail/microfinance-software-2853747527291.html', model: 'YEAR',
    headline: 'Rs 60,000 (1-year licence, excl. taxes)', entry: 60000, top: null,
    notes: ['Multi-user, mobile and PC, Windows, live online training, backup, installation included, free demo. Not available on rent.'],
  },
  {
    name: 'Varun info solutions', url: 'https://www.indiamart.com/proddetail/micro-finance-software-emi-loan-management-software-2857028281248.html', model: 'YEAR',
    headline: 'Rs 95,000 (1-year renewable or lifetime licence, excl. taxes)', entry: 95000, top: null,
    notes: ['For 51 - 200 users. Loan management, partner app and customer app, on-premise or cloud (cloud hosting price not stated), phone/email/remote support. Free demo on request.'],
  },
  {
    name: 'ERP software India', url: 'https://erpsoftware.in/micro-finance-software.php', model: 'SUB',
    headline: 'Standard Rs 51,000 / Advance 60,000 / Premium 70,000 (period not stated)', entry: 51000, top: 70000,
    notes: ['Agent management, multiple interest rates, mobile app, branch management, unlimited login, custom domain, custom module. Which feature belongs to which plan could not be read - check the live page.'],
  },
  {
    name: 'Habile technologies', url: 'https://nbfcsoftwares.com/how-much-loan-management-software-cost-in-india/', model: 'SUB',
    headline: 'Article: SaaS Rs 15,000 - 75,000/month (small), Rs 75,000 - 3,00,000/month (mid-tier)', entry: 180000, top: null,
    notes: [
      'Market guide, not a price list. Enterprise licensed software Rs 15 - 75 lakh upfront + annual fees; custom build Rs 30 lakh - 1.5 crore.',
      'Implementation / onboarding Rs 1 - 10 lakh one-time; one-time licence AMC usually 15 - 20% of licence value; per-loan-account pricing "a few rupees to tens of rupees".',
      'Budget by size: early stage Rs 25,000 - 1 lakh/month + 1 - 3 lakh setup; growing Rs 1 - 4 lakh/month + 5 - 15 lakh setup.',
    ],
  },
  {
    name: 'Fly fusion software', url: 'https://dir.indiamart.com/impcat/nidhi-company-software.html', model: 'RANGE',
    headline: 'Directory page: Nidhi software listings Rs 5,000 - 5,00,000 (most Rs 25,000 - 90,000)', entry: null, top: null,
    notes: ['Fly Fusion is not among the listings read (page has "Show More"). Units mostly not stated; some are 1 or 2 year licences.'],
  },
  {
    name: 'SquareNow (Kapiital Systems)', url: 'https://squarenow.in/', model: 'NONE',
    headline: 'No price published - "entry pricing is sized for small books and scales with AUM"', entry: null, top: null,
    notes: [
      'AI lending platform (loan origination + loan management) by Kapiital Systems Pvt Ltd, with a Microfinance JLG & SHG product, NBFC / digital lender and gold-loan coverage, plus a field-force module (KYEHR).',
      'No pricing page linked and no figures on the site. Price is described as scaling with AUM (the size of the loan book), not with users or branches.',
      'Free evaluation: demo, 20-minute walkthrough and configuration blueprint cost nothing; free trial not mentioned. Standard go-live 4 - 6 weeks. AWS Mumbai data-residency option.',
    ],
  },
  {
    name: 'CloudHouse Technologies', url: 'https://cloudhousetechnologies.com/products/gold-loan-application', model: 'LIC',
    headline: 'Gold loan software: one-time Rs 16,500 + GST for 1 branch, unlimited users; AMC Rs 2,000 + GST/yr from year 2', entry: 16500, top: null,
    notes: [
      'Gold loan management for NBFCs, cooperative banks and jewellery lenders. Licence is by branch tier: 1, up to 5, up to 10, up to 20 branches (only the 1-branch price is shown); above 20 branches is a custom quote. Unlimited users.',
      'Included: Aadhaar / PAN eKYC, gold appraisal with live gold price and LTV, disbursement and EMI tracking, vault custody (QR / barcode), auction management, customer mobile app (Android + iOS), RBI NBS-7 reporting, CIBIL / Equifax reporting, GST and TDS.',
      'Not a microfinance product: MFIs appear only as an audience. GPS tracking, HR and hosting charges are not mentioned. FAQ mentions a 14-day trial for plans the page does not name.',
    ],
  },
  {
    name: 'TaxHint (gold loan software)', url: 'https://taxhint.in/gold-loan-management-software/', model: 'RANGE',
    headline: 'Gold loan software "from Rs 5,000" - final price depends on scale and modules', entry: 5000, top: null,
    notes: [
      'TaxHint Advisors is mainly a company-registration firm that also sells cloud gold loan software: appraisal, pledge, vault, renewal, auction, Android and collection apps, SMS, eKYC, CIBIL check. Unlimited users.',
      'Base price is said to include configuration, data migration and staff training. Cloud by default; on-premise on request, quoted separately. Go-live 2 - 4 weeks. Demo on your own data.',
      'Model, unit and period are not stated. Part of this page was read from a summary, so verify the figures on the live page.',
    ],
  },
  {
    name: 'SB Creation Group (Renu SB Creation)', url: 'https://www.sbcreationgroup.com/loan-management-software', model: 'RANGE',
    headline: 'Microfinance from Rs 35,000, Nidhi from Rs 35,000, DSA from Rs 40,000 - depends on branches, agents, customers', entry: 35000, top: null,
    notes: [
      'This URL is a blog post (29 Aug 2025), not a product page; it links to a separate microfinance product page that was not read.',
      'Microfinance edition: SHG / JLG group loans, recurring collection tracking, mobile app for field officers, portfolio monitoring. Price model, GST, setup and AMC not stated. Free demo offered.',
    ],
  },
  {
    name: 'IDSPay', url: 'https://www.idspay.in/microfinance-software', model: 'NONE',
    headline: 'Quote only - "no hidden charges or forced annual updates"', entry: null, top: null,
    notes: [
      'Microfinance / NBFC software for MFIs, NBFCs, NGOs and cooperatives. Lists: JLG / SHG group management, centre meetings, "Field Agent Tracking" (module name, no detail), offline mobile collection, Android app, accounting, SMS reminders, credit bureau (CIBIL / Equifax / Highmark), eKYC, UPI / net-banking EMI payment.',
      'Cloud with 99.9% uptime and automated database backups; no hosting or backup charge stated. Gold loan is on a separate linked page. Free demo; no prices on the page.',
    ],
  },
  {
    name: 'Jaguar Software India', url: 'https://jaguarsoftwareindia.com/solutions/microfinance-group-loans-software/', model: 'NONE',
    headline: 'Pricing not published - demo only', entry: null, top: null,
    notes: [
      'Jaguar 360 Cloud for MFIs, NBFC-MFIs, banks, NBFCs and HFCs. Native JLG / SHG with inter-loaning, centre meetings and attendance; offline field sales app and collection app with GPS stamping; eKYC, credit bureau and insurance integration.',
      'Live field-agent tracking, gold loan and hosting charges are not mentioned. Offices in Jalandhar, Hyderabad and Bengaluru.',
    ],
  },
  {
    name: 'Finsta (Kapil IT Solutions)', url: 'https://finsta.in/products/nbfc-software/', model: 'NONE',
    headline: 'Customised pricing after a needs assessment (branches, loan volume, modules)', entry: null, top: null,
    notes: [
      'NBFC suite from Kapil IT Solutions (Hyderabad): LOS, LMS, loan collection, core banking, accounting (IFMS), plus gold, JLG and SHG loan software and three apps (digital onboarding, customer, collection).',
      'No figures, GST basis, setup or AMC on the page. GPS tracking and hosting are not mentioned. Free demo.',
    ],
  },
];

export const MODEL_INFO = {
  LIC: { label: 'Licence + yearly AMC', hint: 'Pay once, then a yearly maintenance fee' },
  SUB: { label: 'Subscription', hint: 'Monthly / yearly plan or tiers' },
  YEAR: { label: 'Yearly licence', hint: 'Marketplace listing, usually 1-year licence' },
  RANGE: { label: 'Price range only', hint: 'No plan table, a range of costs' },
  NONE: { label: 'No price visible', hint: 'Contact for quote / page blocked' },
};


// Side-by-side attributes, exactly as each page stated them ('Not stated' = the page did not say).
// level: 'yes' (included / good for buyer), 'paid' (extra cost), 'no' (not offered), 'na' (not stated)
const NS = 'Not stated';
const na = (t = NS) => ({ t, l: 'na' });
const yes = (t) => ({ t, l: 'yes' });
const paid = (t) => ({ t, l: 'paid' });
const no = (t) => ({ t, l: 'no' });

const CMP = {
  'CloudHouse Technologies': { billing: 'One-time licence per branch tier + yearly AMC', pricedBy: yes('Branch tiers (1 / 5 / 10 / 20); users unlimited'), limits: yes('Unlimited users; 1 to 20 branches by tier'), mobile: yes('Customer app (Android + iOS) included'), hosting: na('Cloud or on-premise not stated; no hosting charge'), setup: na(), amc: paid('Rs 2,000 + GST/yr, billed from year two'), demo: yes('Free demo; 14-day trial mentioned'), tax: no('Excl. GST') },
  'TaxHint (gold loan software)': { billing: '"From" price (scale and modules)', pricedBy: yes('Scale + modules; unlimited users'), limits: yes('Unlimited users; multiple branches'), mobile: yes('Android app + collection app'), hosting: yes('Cloud by default; on-premise quoted separately'), setup: yes('Configuration, data migration, training included'), amc: na('Support listed, no price'), demo: yes('Live walkthrough on your data'), tax: na() },
  'SB Creation Group (Renu SB Creation)': { billing: '"Starts from" price (size dependent)', pricedBy: yes('Branches, agents and customers'), limits: na(), mobile: yes('Mobile app for field officers'), hosting: na('Cloud called cheaper than local install; no charge stated'), setup: na(), amc: na(), demo: yes('Free demo'), tax: na() },
  'IDSPay': { billing: 'Quote only', pricedBy: na(), limits: na(), mobile: yes('Integrated Android app + offline mobile collection'), hosting: yes('Secure cloud, 99.9% uptime, automated backups; no charge stated'), setup: na(), amc: na('"No forced annual updates"'), demo: yes('Free demo'), tax: na() },
  'Jaguar Software India': { billing: 'Not published', pricedBy: na(), limits: na(), mobile: yes('Offline field sales app + collection app'), hosting: yes('Jaguar 360 Cloud; no charge stated'), setup: na(), amc: na(), demo: yes('Book a demo'), tax: na() },
  'Finsta (Kapil IT Solutions)': { billing: 'Custom after needs assessment', pricedBy: yes('Branch count, loan volume, modules'), limits: na(), mobile: yes('Onboarding, customer and collection apps'), hosting: na(), setup: na(), amc: na(), demo: yes('Free demo'), tax: na() },
  'SquareNow (Kapiital Systems)': { billing: 'Not published (scales with AUM)', pricedBy: yes('Loan book size (AUM)'), limits: na(), mobile: na('WhatsApp-first borrower journeys and field collection mentioned; mobile app not mentioned'), hosting: na('AWS Mumbai data-residency option; no charge stated'), setup: na('Go-live 4 - 6 weeks; walkthrough and configuration blueprint are free'), amc: na(), demo: yes('Free demo + 20-minute walkthrough; free trial not mentioned'), tax: na() },
  'Microfinsoft': { billing: 'Page blocked', pricedBy: na('Not read'), limits: na('Not read'), mobile: na('Not read'), hosting: na('Not read'), setup: na('Not read'), amc: na('Not read'), demo: na('Not read'), tax: na('Not read') },
  'AMY Fintech': { billing: 'Licence once + yearly maintenance', pricedBy: yes('Members + branches (5 tiers)'), limits: yes('300 to unlimited members; 1 to unlimited branches'), mobile: yes('Staff app from Standard; staff + customer apps from Premium. Extra apps Rs 10,000 - 30,000'), hosting: yes('Covered by yearly maintenance; upgrade Rs 5,000 - 15,000/yr'), setup: paid('Data migration Rs 3,000 - 20,000'), amc: paid('Rs 5,000 - 15,000/yr (microfinance); Rs 8,000 - 25,000/yr (NBFC)'), demo: no('None shown'), tax: na() },
  'Vector nidhi software': { billing: 'Monthly', pricedBy: yes('Module package (basic / add-on)'), limits: na(), mobile: paid('Customer + collection apps in Rs 3,000/month add-on package'), hosting: na(), setup: na(), amc: na('Not stated (monthly plan)'), demo: yes('Free demo'), tax: na() },
  'CK Tech solutions': { billing: 'One-time + yearly support', pricedBy: yes('Plan + extra branches (Rs 2,000/yr each)'), limits: yes('Startup: 1 branch, 1 user; Elite: 5+ branches, 5+ users'), mobile: yes('Included in Elite; add-on Rs 10,000 + about Rs 5,000/yr'), hosting: na(), setup: yes('One-time fee is the implementation; "no hidden" fees'), amc: paid('Rs 6,000 - 20,000/yr'), demo: yes('Free 2-month trial + live demo'), tax: yes('Prices include GST') },
  'Hubco': { billing: 'Monthly or yearly', pricedBy: yes('Single plan; features charged extra'), limits: na(), mobile: paid('Android app for members + staff Rs 35,000'), hosting: na(), setup: paid('Add-ons have one-time fees (gateway 20,000; internet banking 15,000)'), amc: na(), demo: yes('Free demo request'), tax: no('Excl. GST') },
  'Ecsoft pvt.ltd': { billing: 'Yearly licence', pricedBy: na('Single price'), limits: yes('Above 500 users'), mobile: yes('Android field app listed'), hosting: yes('Cloud'), setup: yes('Installation service included'), amc: na(), demo: yes('Free download + demo'), tax: no('Excl. taxes') },
  'Genuine IT solution': { billing: 'Yearly licence', pricedBy: na('Single price'), limits: yes('Above 500 users'), mobile: yes('Android field app listed'), hosting: yes('Cloud'), setup: yes('Installation service included'), amc: na(), demo: yes('Free download + demo'), tax: no('Excl. taxes') },
  'Zetu solutions': { billing: 'Price only (unit not stated)', pricedBy: na('Single price'), limits: na(), mobile: yes('Windows + Android'), hosting: yes('Online service'), setup: na(), amc: na(), demo: na(), tax: no('Excl. taxes') },
  'Aspire software and services': { billing: 'No price shown', pricedBy: na('Quote on request'), limits: na(), mobile: yes('Mobile access listed'), hosting: na(), setup: na(), amc: na(), demo: na(), tax: na() },
  'Websoftex': { billing: 'Fixed price per set', pricedBy: na('Single price'), limits: na(), mobile: yes('Web + mobile'), hosting: yes('Online or offline'), setup: na(), amc: na('"Multiple" (unclear)'), demo: yes('Sample available'), tax: yes('0% GST shown') },
  'Genius Technology': { billing: 'Price range only', pricedBy: yes('Requirements + customisation'), limits: na(), mobile: paid('Android app is an add-on (no price)'), hosting: yes('Cloud (SaaS) or on-premise'), setup: na(), amc: na(), demo: yes('Request demo'), tax: na() },
  'Softdew Tech': { billing: 'Yearly licence', pricedBy: yes('Users (up to 10)'), limits: yes('Up to 10 users, multi-branch'), mobile: yes('Field app + customer app included'), hosting: yes('Cloud'), setup: na(), amc: na(), demo: na(), tax: no('Excl. taxes') },
  'Green Apps solutions': { billing: 'Price only (unit not stated)', pricedBy: na('Single price'), limits: na(), mobile: yes('Windows + Android'), hosting: yes('Online service'), setup: na(), amc: na(), demo: na(), tax: no('Excl. taxes') },
  'Best software enterprise': { billing: 'Tiers (period not stated)', pricedBy: yes('Tier: users + support level'), limits: yes('Starter: single user; Professional: multi-user'), mobile: yes('Mobile app from Starter'), hosting: na(), setup: na(), amc: na(), demo: yes('Free evaluation trial'), tax: na() },
  'NK solutions': { billing: 'Yearly licence (1 year)', pricedBy: na('Single price'), limits: yes('Multi-user'), mobile: yes('Mobile + PC'), hosting: yes('Windows install; backup included'), setup: yes('Installation + live online training'), amc: na(), demo: yes('Free demo'), tax: no('Excl. taxes') },
  'Varun info solutions': { billing: 'Yearly (renewable) or lifetime licence', pricedBy: yes('User band'), limits: yes('51 to 200 users'), mobile: yes('Partner app + customer app'), hosting: yes('On-premise; cloud option (no price)'), setup: na(), amc: na('Email / phone / remote support'), demo: yes('Free demo on request'), tax: no('Excl. taxes') },
  'ERP software India': { billing: 'Tiers (period not stated)', pricedBy: yes('Plan (3 versions)'), limits: yes('Unlimited users / login'), mobile: yes('Mobile app listed (plan unclear)'), hosting: yes('Cloud, 99.99% uptime'), setup: yes('Custom module free'), amc: na(), demo: yes('Request demo'), tax: na() },
  'Habile technologies': { billing: 'Guide: subscription, per-account or licence + AMC', pricedBy: yes('Users, active loan accounts or feature tier'), limits: na('Depends on loan book'), mobile: na(), hosting: yes('SaaS includes hosting'), setup: paid('Implementation Rs 1 - 10 lakh one-time'), amc: paid('15 - 20% of licence value'), demo: na(), tax: na() },
  'Fly fusion software': { billing: 'Not on directory page', pricedBy: na(), limits: na(), mobile: na(), hosting: na(), setup: na(), amc: na(), demo: na(), tax: na() },
};


// How each company's price scales with users, branches, clients (members) and modules.
// l: 'yes' = price or plan limit depends on it | 'no' = no limit / not charged for it | 'na' = page does not say
// sarvam = rough first-year cost (excl. GST) at 230 staff, 50 branches, 50,000 clients, read from the published
// price list. conf: 'limits' = plan limits stated and cover Sarvam | 'flat' = no limits stated, flat price | 'quote' = needs a quote
const SCALE = {
  'CloudHouse Technologies': { users: no('Unlimited users'), branches: yes('Price by branch tier: 1 branch Rs 16,500; 5 / 10 / 20 branch tiers priced on request'), clients: na(), modules: yes('Gold loan product: appraisal, vault, auction and app included'), sarvam: { t: 'Above 20 branches is a custom quote', conf: 'quote' } },
  'TaxHint (gold loan software)': { users: no('Unlimited users'), branches: na('Multiple, count not stated'), clients: na(), modules: yes('"Every module listed" included; no per-module price'), sarvam: { t: 'From Rs 5,000; final price depends on scale and modules', conf: 'quote' } },
  'SB Creation Group (Renu SB Creation)': { users: na(), branches: yes('Price depends on branches'), clients: yes('and on customers (and agents)'), modules: na('Separate microfinance, DSA and Nidhi editions'), sarvam: { t: 'Starts from Rs 35,000; size-dependent', conf: 'quote' } },
  'IDSPay': { users: na(), branches: na(), clients: na(), modules: yes('Group management, field tracking, offline collection, accounting, SMS, bureau, eKYC, gateway listed; priced together by quote'), sarvam: { t: 'Quote only', conf: 'quote' } },
  'Jaguar Software India': { users: na(), branches: na(), clients: na(), modules: na('Native JLG / SHG, centre meetings, eKYC, bureau; no module prices'), sarvam: { t: 'Not published', conf: 'quote' } },
  'Finsta (Kapil IT Solutions)': { users: na(), branches: yes('Price depends on branch count'), clients: yes('and on loan volume'), modules: yes('LOS, LMS, core banking, accounting, gold, JLG / SHG, apps - customised by modules'), sarvam: { t: 'Custom quote', conf: 'quote' } },
  'SquareNow (Kapiital Systems)': {
    users: na('Not priced per user'), branches: na('Not priced per branch'),
    clients: yes('Price scales with loan book size (AUM), not client or user count'),
    modules: na('Platform covers origination, servicing, collections, JLG / SHG, gold loans; module prices not stated'),
    sarvam: { t: 'No price published - ask for a quote based on loan book size', conf: 'quote' },
  },
  'Microfinsoft': { users: na('Page not read'), branches: na('Page not read'), clients: na('Page not read'), modules: na('Page not read'), sarvam: { t: 'Page blocked - check the site', conf: 'quote' } },
  'AMY Fintech': {
    users: no('No per-user price; no user limit listed'),
    branches: yes('Tier limit: 1 / 3 / 5 / 10 / unlimited branches'),
    clients: yes('Tier limit: 300 / 700 / 1,200 / 2,000 / unlimited members; eKYC Rs 6 and CIBIL Rs 50 - 75 each'),
    modules: yes('Higher tiers add individual loans, FD, savings; separate MF and NBFC/Nidhi plans; apps, SMS, WhatsApp as add-ons'),
    sarvam: { t: 'Pro Enterprise (unlimited): Rs 1,20,000 + Rs 15,000/yr. NBFC Enterprise Suite: Rs 2,10,000 + Rs 25,000/yr', est: 135000, conf: 'limits' },
  },
  'Vector nidhi software': {
    users: na(), branches: na(), clients: na(),
    modules: yes('Basic modules Rs 2,000/month; add-on modules Rs 3,000/month (apps, portal, payroll)'),
    sarvam: { t: 'Rs 2,000 - 5,000 per month if the price is flat; limits not stated', est: 60000, conf: 'flat' },
  },
  'CK Tech solutions': {
    users: yes('Startup: 1 admin user; Professional: 2+; Elite: 5+'),
    branches: yes('1 branch included; extra branch Rs 2,000/yr; Elite 5+ branches'),
    clients: na('Not stated (Startup: up to 7 schemes)'),
    modules: yes('Repledge, auction, OCR, SMS in Professional; customer app Rs 10,000 + about Rs 5,000/yr'),
    sarvam: { t: 'Enterprise plan is custom priced; Elite (5+ branches) Rs 55,000 + Rs 20,000/yr + 45 extra branches x Rs 2,000 = about Rs 1,65,000', est: 165000, conf: 'quote' },
  },
  'Hubco': {
    users: na(), branches: na(), clients: na(),
    modules: paid('One plan; each extra feature priced: gateway 20,000, Android app 35,000, internet banking 15,000'),
    sarvam: { t: 'Rs 20,000/yr flat + app Rs 35,000 = about Rs 55,000; limits not stated', est: 55000, conf: 'flat' },
  },
  'Ecsoft pvt.ltd': {
    users: yes('Listing says "above 500 users"'), branches: na(), clients: na(), modules: na('Key module: loan origination'),
    sarvam: { t: 'Rs 5,000/yr listing (above 500 users); branch / client limits not stated', est: 5000, conf: 'flat' },
  },
  'Genuine IT solution': {
    users: yes('Listing says "above 500 users"'), branches: na(), clients: na(), modules: na('Key module: loan origination'),
    sarvam: { t: 'Rs 5,000/yr listing (above 500 users); branch / client limits not stated', est: 5000, conf: 'flat' },
  },
  'Zetu solutions': {
    users: na(), branches: na(), clients: na(), modules: na('Feature list only (recovery tracking, SMS, accounting)'),
    sarvam: { t: 'Rs 64,900 listed; no limits stated', est: 64900, conf: 'flat' },
  },
  'Aspire software and services': {
    users: na(), branches: na(), clients: na(), modules: na('Feature list only'),
    sarvam: { t: 'No price shown - needs a quote', conf: 'quote' },
  },
  'Websoftex': {
    users: na(), branches: na(), clients: na(), modules: na('Feature list only'),
    sarvam: { t: 'Rs 10,000 per set; no limits stated', est: 10000, conf: 'flat' },
  },
  'Genius Technology': {
    users: na(), branches: na(), clients: na(),
    modules: paid('Price depends on requirements; Android app, SMS, UPI, Aadhaar, gateway are separate add-ons (no price)'),
    sarvam: { t: 'Rs 40,000 - 1,70,000 range; a large setup would be near the top', est: 170000, conf: 'quote' },
  },
  'Softdew Tech': {
    users: yes('Listed price covers up to 10 users'), branches: yes('Multi-branch supported; count not stated'), clients: na(), modules: na(),
    sarvam: { t: 'Price covers only 10 users; 230 staff needs a quote', conf: 'quote' },
  },
  'Green Apps solutions': {
    users: na(), branches: na(), clients: na(), modules: na('Feature list only'),
    sarvam: { t: 'Rs 64,900 listed; no limits stated', est: 64900, conf: 'flat' },
  },
  'Best software enterprise': {
    users: yes('Starter: single user; Professional: multi-user roles'), branches: na(), clients: na(),
    modules: yes('Starter = core modules; higher tiers add analytics, APIs, ERP connectors'),
    sarvam: { t: 'Enterprise / Custom tier: Rs 2,20,000 (period not stated)', est: 220000, conf: 'quote' },
  },
  'NK solutions': {
    users: yes('Multi-user edition; count not stated'), branches: na(), clients: na(), modules: na(),
    sarvam: { t: 'Rs 60,000/yr listed; user count not stated', est: 60000, conf: 'flat' },
  },
  'Varun info solutions': {
    users: yes('Listed price is for 51 - 200 users'), branches: na(), clients: na(), modules: na('Key module: loan management'),
    sarvam: { t: '230 staff is above the listed 51 - 200 users band - needs a quote (base Rs 95,000)', est: 95000, conf: 'quote' },
  },
  'ERP software India': {
    users: no('"Unlimited login" listed'), branches: yes('Branch management is a feature'), clients: na(),
    modules: yes('3 versions; custom module request free'),
    sarvam: { t: 'Premium: Rs 70,000 (period not stated); unlimited users', est: 70000, conf: 'flat' },
  },
  'Habile technologies': {
    users: yes('Subscriptions can be priced per user'),
    branches: na(),
    clients: yes('Or per active loan account: a few rupees to tens of rupees each'),
    modules: yes('Modules, integrations and customisation drive cost; feature tiers'),
    sarvam: { t: 'Growing lender guide: Rs 1 - 4 lakh/month = Rs 12 - 48 lakh/yr + Rs 5 - 15 lakh setup', est: 1200000, conf: 'quote' },
  },
  'Fly fusion software': {
    users: na(), branches: na(), clients: na(), modules: na(),
    sarvam: { t: 'Not on the directory page read', conf: 'quote' },
  },
};


// Server / web hosting + the MFI, live tracking and jewel (gold) loan modules, as each page states them
// (second read, 21 Nov 2026). l: 'yes' = offered / included | 'paid' = costs extra | 'na' = page does not say
const MODS = {
  'CloudHouse Technologies': { hosting: na('Cloud or on-premise not stated; no hosting charge'), mfi: no('Not a module - MFIs appear only as an audience'), tracking: na('GPS / field tracking not mentioned'), jewel: yes('Core product: appraisal with live gold price + LTV, vault (QR / barcode), auction, from Rs 16,500') },
  'TaxHint (gold loan software)': { hosting: yes('Cloud by default; on-premise on request, quoted separately'), mfi: na('Not mentioned'), tracking: na('"Geo tagging" listed; live tracking not mentioned'), jewel: yes('Core product: appraisal, pledge, vault, renewal, auction, from Rs 5,000') },
  'SB Creation Group (Renu SB Creation)': { hosting: na('Cloud called cheaper than local install; no charge stated'), mfi: yes('SHG / JLG group loans, recurring collection tracking, portfolio monitoring'), tracking: na('Not mentioned'), jewel: na('Not mentioned') },
  'IDSPay': { hosting: yes('Secure cloud, 99.9% uptime, automated backups; no charge stated'), mfi: yes('JLG / SHG group management, centre meetings'), tracking: yes('"Field Agent Tracking" module listed, no detail; price by quote'), jewel: na('Not on this page; a separate gold-loan page is linked') },
  'Jaguar Software India': { hosting: yes('Jaguar 360 Cloud; no hosting charge stated'), mfi: yes('Native JLG / SHG with centre meetings and attendance'), tracking: na('GPS stamping in the offline field app; live tracking not mentioned'), jewel: na('Not mentioned') },
  'Finsta (Kapil IT Solutions)': { hosting: na('Not mentioned'), mfi: yes('JLG and SHG loan software'), tracking: na('Not mentioned'), jewel: yes('Gold loan: appraisal, LTV, vault records; auction not mentioned') },
  'SquareNow (Kapiital Systems)': {
    hosting: na('AWS Mumbai data-residency option; no hosting charge stated'),
    mfi: yes('"Microfinance: JLG & SHG" product; also NBFC and digital lender segments'),
    tracking: na('Live tracking not mentioned; field-force module (KYEHR) and field collection are'),
    jewel: yes('Gold loans covered; separate price not stated'),
  },
  'Microfinsoft': { hosting: na('Page blocked'), mfi: na('Page blocked'), tracking: na('Page blocked'), jewel: na('Page blocked') },
  'AMY Fintech': {
    hosting: yes('Cloud platform. Hosting is included in the yearly maintenance (Rs 5,000 - 25,000); cloud hosting upgrade is an add-on Rs 5,000 - 15,000/yr'),
    mfi: yes('In the base plans: Basic = group loans only (300 members); Standard = group + individual; Premium adds FD'),
    tracking: paid('No GPS or live tracking mentioned. Staff Collection App add-on Rs 10,000 - 25,000 is described as field-agent collection tracking'),
    jewel: yes('Gold loan modules in the NBFC plans (Starter NBFC Rs 45,000 + Rs 8,000/yr); gold vault management in Premium NBFC Rs 1,00,000'),
  },
  'Vector nidhi software': {
    hosting: na('Not stated - only "for computers and mobile"'),
    mfi: na('Not listed - base modules are members, shares, deposits, loans (nidhi)'),
    tracking: na('Not mentioned'),
    jewel: na('Not mentioned'),
  },
  'CK Tech solutions': {
    hosting: yes('Cloud (online) or install on your own computer / server. No hosting fee stated; custom web domain only in Enterprise'),
    mfi: no('Pawn-broking product - no group / SHG / JLG features listed (only deposits and chit funds)'),
    tracking: na('Not mentioned (vault tracking is not location tracking)'),
    jewel: yes('Core product: gold loan + pawn tickets from Startup Rs 10,000 + Rs 6,000/yr; Professional adds repledge, vault, auction'),
  },
  'Hubco': {
    hosting: yes('"Cloud based" software. No hosting charge mentioned; a new website is an add-on Rs 15,000'),
    mfi: yes('In the base plan Rs 2,000/month: SHG management, group or individual loans, NACH collections'),
    tracking: na('Not mentioned'),
    jewel: na('Not mentioned'),
  },
  'Ecsoft pvt.ltd': {
    hosting: na('Listing says cloud but also offline / Windows; no hosting price'),
    mfi: na('Daily-collection finance software; "microfinance" appears only as a loan type'),
    tracking: na('Not mentioned'),
    jewel: yes('"Gold loan" is listed as a loan type; no separate module or price'),
  },
  'Genuine IT solution': {
    hosting: na('Listing says cloud but also offline / Windows; no hosting price'),
    mfi: na('Daily-collection finance software; "microfinance" appears only as a loan type'),
    tracking: na('Not mentioned'),
    jewel: yes('"Gold loan" is listed as a loan type; no separate module or price'),
  },
  'Zetu solutions': {
    hosting: na('"Service mode: online"; no hosting price'),
    mfi: yes('Sold as microfinance management software; group / SHG features not listed'),
    tracking: yes('"Track field recovery executive" - no GPS detail; no separate charge, so inside the Rs 64,900'),
    jewel: na('Not mentioned'),
  },
  'Aspire software and services': {
    hosting: na('Web and mobile, SQL database; cloud / on-premise not stated'),
    mfi: yes('Microfinance operations and loan management (listing of Vexil Infotech); group features not listed'),
    tracking: na('"Geo tagging" listed; live tracking not mentioned; price on request'),
    jewel: na('Not mentioned'),
  },
  'Websoftex': {
    hosting: na('"Online / offline"; no hosting charge stated'),
    mfi: yes('Group information and financial management for MFIs, head office and branch operations'),
    tracking: na('Not mentioned'),
    jewel: yes('Second listing (Rs 60,000) names "gold loan" as a loan type'),
  },
  'Genius Technology': {
    hosting: na('Describes cloud (SaaS) and on-premise in general; no hosting charge'),
    mfi: yes('Group management, group loans, centre to zone, members, collections are listed; whether base or extra is not stated'),
    tracking: na('"Field operations mobility" and "remote monitoring" mentioned; no GPS wording; cost not stated'),
    jewel: na('Not mentioned'),
  },
  'Softdew Tech': {
    hosting: yes('Cloud deployment; hosting cost not mentioned'),
    mfi: yes('Microfinance is a listed loan type; group / SHG features not listed; collection via UPI, NACH, cash'),
    tracking: na('Not mentioned'),
    jewel: yes('"Gold loan" is a listed loan type; no separate module price'),
  },
  'Green Apps solutions': {
    hosting: na('"Service mode: online"; no hosting price'),
    mfi: yes('Sold as microfinance management software; group / SHG features not listed'),
    tracking: yes('"Track field recovery executive" - no GPS detail; no separate charge, so inside the Rs 64,900'),
    jewel: na('Not mentioned'),
  },
  'Best software enterprise': {
    hosting: na('Not mentioned'),
    mfi: yes('JLG and SHG centre-meeting loan management and cash collection; which tier includes it is not stated'),
    tracking: na('Not mentioned'),
    jewel: na('Not mentioned'),
  },
  'NK solutions': {
    hosting: na('Windows, mobile and PC; cloud / on-premise not stated; installation and backup included'),
    mfi: na('No module detail on the listing'),
    tracking: na('Not mentioned'),
    jewel: na('Not mentioned'),
  },
  'Varun info solutions': {
    hosting: yes('Web / cloud / on-premise; "cloud hosting option available" - price not stated (spec table says on-premise)'),
    mfi: yes('Loan management, EMI, KYC; "ideal for NBFCs, credit co-ops, SHGs and MFIs"; group features not listed'),
    tracking: na('Not mentioned'),
    jewel: na('Not mentioned'),
  },
  'ERP software India': {
    hosting: yes('Cloud based, desktop version with online sync; custom domain row has no price; hosting not priced'),
    mfi: yes('Customers, EMI, agents, employees, expenses, interest rates, reminders; group features not listed'),
    tracking: na('Not mentioned'),
    jewel: na('Not mentioned'),
  },
  'Habile technologies': {
    hosting: yes('Guide: SaaS "includes hosting, updates and support"; on-premise needs servers and an IT team (extra cost, no figure). Page is branded "NBFC Software"'),
    mfi: na('General loan-management guide, not MFI specific'),
    tracking: na('Not mentioned'),
    jewel: paid('Gold loan is a product type that "adds configuration cost" - no figure'),
  },
  'Fly fusion software': { hosting: na('Not on the page read'), mfi: na('Not on the page read'), tracking: na('Not on the page read'), jewel: na('Not on the page read') },
};

// HR / payroll: only three pages mention anything close to it; everyone else does not say.
const HR_FOUND = {
  'Vector nidhi software': paid('Payroll is inside the Rs 3,000/month add-on modules'),
  'Aspire software and services': yes('Payroll listed on the listing (seller Vexil Infotech); price on request'),
  'ERP software India': yes('Employee and expense modules listed; which plan includes them could not be read'),
  'Websoftex': yes('Second listing (Rs 60,000) has an HR module'),
};
Object.keys(MODS).forEach((k) => { MODS[k].hr = HR_FOUND[k] || na('HR / payroll not mentioned'); });

export const COMPETITORS = RAW.map((c, i) => {
  const host = new URL(c.url).hostname.replace(/^www\./, '');
  const source = /indiamart/.test(host) ? 'IndiaMART' : /tradeindia/.test(host) ? 'TradeIndia' : 'Company site';
  return { id: i + 1, host, source, cmp: CMP[c.name], scale: SCALE[c.name], mods: MODS[c.name], ...c };
});
