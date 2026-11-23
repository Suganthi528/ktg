import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3, Search, ExternalLink, Building2, Store, Globe, ChevronDown, Lightbulb, Scale, Wallet, Table2, Users, SlidersHorizontal, Server,
} from 'lucide-react';
import { COMPETITORS, MODEL_INFO } from '../models/competitors.model.js';
import { DEFAULT_RATES, calculate } from '../models/pricing.model.js';
import { estimateFor } from '../models/marketEstimate.js';

const SOURCES = ['All', 'Company site', 'IndiaMART', 'TradeIndia'];
const inr = (n) => 'Rs ' + Math.round(n).toLocaleString('en-IN');
const lakh = (n) => (n >= 100000 ? 'Rs ' + (n / 100000).toFixed(n % 100000 === 0 ? 0 : 2) + ' L' : inr(n));

function readJson(k) {
  try {
    return JSON.parse(localStorage.getItem(k)) || {};
  } catch {
    return {};
  }
}

const SIZE_DEFAULT = { users: 10, branches: 2, clients: 500, backup: true, mfi: true, tracking: false, hr: false, mobileApp: false, jewelLoan: false };
const loadSize = () => ({ ...SIZE_DEFAULT, ...readJson('sp_inp') });
const MODULE_TOGGLES = [['mfi', 'MFI'], ['tracking', 'Live tracking'], ['hr', 'HR'], ['mobileApp', 'Mobile app'], ['jewelLoan', 'Jewel loan']];

// Our own first-year cost (excl. GST) for comparison: hosting x 12 + one-time charges
function ourFirstYear(inp) {
  const rates = { ...DEFAULT_RATES, ...readJson('sp_rates') };
  const r = calculate({ ...inp, mode: 'separate' }, rates);
  return { firstYear: r.monthly * 12 + r.oneTimeBase, monthly: r.monthly, oneTime: r.oneTimeBase, plan: r.plan.name };
}

export default function MarketAnalysisView() {
  const [q, setQ] = useState('');
  const [source, setSource] = useState('All');
  const [model, setModel] = useState('All');
  const [open, setOpen] = useState(null);
  const [onlyPriced, setOnlyPriced] = useState(false);
  const [sortBy, setSortBy] = useState('order');
  const [filterMods, setFilterMods] = useState(true);
  const [multiOnly, setMultiOnly] = useState(false);

  // Quote size: shared with the Quotation / Calculator pages through localStorage 'sp_inp'
  const [size, setSize] = useState(loadSize);
  useEffect(() => {
    const sync = () => setSize(loadSize());
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);
  const updateSize = (patch) => {
    setSize((prev) => {
      const next = { ...prev, ...patch };
      const num = (x) => (x === '' ? 0 : Math.max(0, Number(x) || 0));
      ['users', 'branches', 'clients'].forEach((k) => { if (k in patch) next[k] = patch[k] === '' ? '' : num(patch[k]); });
      if (('users' in patch || 'tracking' in patch) && !next.trackedUsersManual) next.trackedUsers = num(next.users);
      try {
        localStorage.setItem('sp_inp', JSON.stringify({ ...readJson('sp_inp'), ...next }));
      } catch {
        /* ignore */
      }
      return next;
    });
  };
  const sizeNum = useMemo(() => ({
    users: Number(size.users) || 0, branches: Number(size.branches) || 0, clients: Number(size.clients) || 0,
    mfi: !!size.mfi, tracking: !!size.tracking, hr: !!size.hr, mobileApp: !!size.mobileApp, jewelLoan: !!size.jewelLoan,
  }), [size]);

  // Clicking a module narrows every table and chart to the companies whose pages say they offer it
  const has = (l) => l === 'yes' || l === 'paid';
  const MOD_OFFER = {
    mfi: (c) => c.mods?.mfi?.l === 'yes',
    tracking: (c) => has(c.mods?.tracking?.l),
    hr: (c) => has(c.mods?.hr?.l),
    mobileApp: (c) => has(c.cmp?.mobile?.l),
    jewelLoan: (c) => has(c.mods?.jewel?.l),
  };
  // How many of the 5 modules (MFI, live tracking, HR, mobile app, jewel loan) a company's page says it offers
  const modCount = (c) => Object.values(MOD_OFFER).filter((f) => f(c)).length;
  const activeMods = MODULE_TOGGLES.filter(([k]) => size[k]).map(([k]) => k);
  const activeKey = activeMods.join(',');
  const shown = useMemo(
    () => (filterMods ? COMPETITORS.filter((c) => activeMods.every((k) => MOD_OFFER[k](c))) : COMPETITORS),
    [filterMods, activeKey] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const mine = useMemo(() => {
    const saved = size;
    return [
      { label: 'Your quote (current inputs)', ...ourFirstYear(saved), sub: `${saved.users} staff, ${saved.branches} branches, ${Number(saved.clients).toLocaleString('en-IN')} customers` },
      { label: 'Our starter (MFI only)', ...ourFirstYear({ users: 10, branches: 2, clients: 500, backup: true, mfi: true, tracking: false, hr: false, mobileApp: false, jewelLoan: false }), sub: '10 staff, 2 branches, 500 customers' },
    ];
  }, [size]);

  const ratesNow = useMemo(() => ({ ...DEFAULT_RATES, ...readJson('sp_rates') }), []);
  const ours = {
    name: 'Knock The Globe (us)',
    entry: mine[0].firstYear,
    cmp: {
      billing: 'Monthly hosting at cost + one-time fees',
      pricedBy: { t: 'Staff, branches, customers, modules and API load', l: 'yes' },
      limits: { t: 'No fixed limit - server sized to load', l: 'yes' },
      mobile: { t: `Mobile app module, one-time ${inr(ratesNow.moduleFee?.mobileApp ?? 2500)}`, l: 'paid' },
      hosting: { t: 'Included in monthly: server, database, storage, backup, map', l: 'yes' },
      setup: { t: `Setup ${inr(ratesNow.setupFee)} + licence fees`, l: 'paid' },
      amc: { t: 'Covered by monthly charge', l: 'yes' },
      demo: { t: 'Not stated', l: 'na' },
      tax: { t: `Excl. GST (+${ratesNow.gstPct ?? 18}%)`, l: 'no' },
    },
  };

  const sarvamOurs = mine[0];
  const rm = ratesNow;
  const oursScale = {
    users: { t: `${inr(rm.perUser)} per staff, one-time. More staff also raises server load and monthly hosting`, l: 'paid' },
    branches: { t: `${inr(rm.perBranch)} per branch, one-time`, l: 'paid' },
    clients: { t: `${inr(rm.perClient)} per customer, one-time. Their documents also add storage cost to the monthly bill`, l: 'paid' },
    modules: { t: `One-time: MFI ${inr(rm.moduleFee?.mfi ?? 3000)}, tracking ${inr(rm.moduleFee?.tracking ?? 1500)}, HR ${inr(rm.moduleFee?.hr ?? 2000)}, mobile app ${inr(rm.moduleFee?.mobileApp ?? 2500)}, jewel loan ${inr(rm.moduleFee?.jewelLoan ?? 2000)}, backup ${inr(rm.moduleFee?.backup ?? 500)}. Each module also adds server load, so monthly hosting moves`, l: 'paid' },
    sarvam: { t: `${inr(sarvamOurs.monthly)}/month hosting + ${inr(sarvamOurs.oneTime)} one-time (${sarvamOurs.plan})`, est: sarvamOurs.firstYear, conf: 'ours' },
  };
  const estimates = useMemo(() => Object.fromEntries(COMPETITORS.map((c) => [c.name, estimateFor(c.name, sizeNum)])), [sizeNum]);
  const estVal = (e) => (e.est ?? e.low ?? null);
  const liveRows = useMemo(() => {
    const list = shown.map((c) => ({ name: c.name, ...estimates[c.name] }));
    const withNum = list.filter((r) => estVal(r) != null).sort((a, b) => estVal(a) - estVal(b));
    const without = list.filter((r) => estVal(r) == null);
    return { withNum, without };
  }, [estimates, shown]);
  // Scale the bars to our price and the real figures; the Habile guide range (up to Rs 48 L) is clipped so it does not flatten everything else
  const liveMax = Math.max(sarvamOurs.firstYear, ...liveRows.withNum.map((r) => (r.plan === 'Guide only' ? r.low : r.high ?? r.est ?? r.low)));
  const liveMedian = (() => {
    const vals = liveRows.withNum.map(estVal).sort((a, b) => a - b);
    return vals.length ? vals[Math.floor(vals.length / 2)] : 0;
  })();
  // Our own cost for hosting and each module at the current client size (monthly = hosting, one-time = licence fee)
  const oursMods = useMemo(() => {
    const rates = { ...DEFAULT_RATES, ...readJson('sp_rates') };
    const calc = (o) => calculate({ ...o, mode: 'separate' }, rates);
    const now = calc(size);
    const delta = (key) => {
      const on = calc({ ...size, [key]: true });
      const off = calc({ ...size, [key]: false });
      return Math.round(on.monthly - off.monthly);
    };
    const fee = rates.moduleFee || {};
    const money = (n) => (n > 0 ? '+' + inr(n) : inr(n));
    return {
      hosting: { t: `${inr(now.monthly)}/month at cost: ${now.plan.name} server, ${now.dbPlan.name}, storage, backup${size.tracking ? ', Google Maps' : ''}. Billed monthly, not hidden in a licence`, l: 'yes' },
      mfi: { t: `${inr(fee.mfi ?? 3000)} one-time ${size.mfi ? `(on now: ${money(delta('mfi'))}/month hosting)` : `(adds about ${money(delta('mfi'))}/month hosting)`}`, l: 'paid' },
      tracking: { t: `${inr(fee.tracking ?? 1500)} one-time + Google Maps usage ${size.tracking ? `(on now: ${money(delta('tracking'))}/month)` : `(adds about ${money(delta('tracking'))}/month)`}`, l: 'paid' },
      jewel: { t: `${inr(fee.jewelLoan ?? 2000)} one-time ${size.jewelLoan ? `(on now: ${money(delta('jewelLoan'))}/month hosting)` : `(adds about ${money(delta('jewelLoan'))}/month hosting)`}`, l: 'paid' },
    };
  }, [size]);
  const MOD_COLS = [['hosting', 'Server / web hosting'], ['mfi', 'MFI module'], ['tracking', 'Live tracking'], ['jewel', 'Jewel (gold) loan']];
  const SCALE_COLS = [['users', 'Per user (staff)'], ['branches', 'Per branch'], ['clients', 'Per client / member'], ['modules', 'Modules / add-ons']];
  const priced = COMPETITORS.filter((c) => c.entry);
  const sortedEntry = [...priced].sort((a, b) => a.entry - b.entry);
  const median = sortedEntry[Math.floor(sortedEntry.length / 2)]?.entry || 0;
  const sortedShown = shown.filter((c) => c.entry).sort((a, b) => a.entry - b.entry);
  const chartMax = Math.max(...sortedShown.map((c) => c.top || c.entry), ...mine.map((m) => m.firstYear));

  const models = useMemo(() => {
    const m = {};
    COMPETITORS.forEach((c) => (m[c.model] = (m[c.model] || 0) + 1));
    return m;
  }, []);

  const matrixRows = useMemo(() => {
    let list = shown.filter((c) => !onlyPriced || c.entry);
    if (sortBy === 'price') list = [...list].sort((a, b) => (a.entry ?? Infinity) - (b.entry ?? Infinity));
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [onlyPriced, sortBy, shown]);

  const count = (key, lvl) => COMPETITORS.filter((c) => c.cmp?.[key]?.l === lvl).length;
  const MATRIX_COLS = [
    ['billing', 'How billed'],
    ['pricedBy', 'Priced by'],
    ['limits', 'Limits'],
    ['mobile', 'Mobile app'],
    ['hosting', 'Hosting'],
    ['setup', 'Setup / implementation'],
    ['amc', 'Maintenance / AMC'],
    ['demo', 'Demo / trial'],
    ['tax', 'Tax'],
  ];
  const cell = (v) => (typeof v === 'string' ? { t: v, l: 'plain' } : v || { t: '-', l: 'na' });

  const rows = shown.filter(
    (c) =>
      (!multiOnly || modCount(c) >= 2) &&
      (source === 'All' || c.source === source) &&
      (model === 'All' || c.model === model) &&
      (c.name + ' ' + c.host + ' ' + c.headline).toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <div className="app-wrapper mk-page">
      <header className="app-header">
        <div className="header-icon-box" aria-hidden="true"><BarChart3 size={20} /></div>
        <div className="header-text">
          <h1>Market Analysis</h1>
          <p>How competitor microfinance software companies charge - read from their pricing pages on 21 Nov 2026</p>
        </div>
      </header>

      <div className="mk-stats">
        <div><Building2 size={18} /><b>{COMPETITORS.length}</b><span>Companies listed</span></div>
        <div><Wallet size={18} /><b>{priced.length}</b><span>Show a price</span></div>
        <div><Scale size={18} /><b>{lakh(sortedEntry[0].entry)} - {lakh(Math.max(...priced.map((c) => c.top || c.entry)))}</b><span>First-year range (median {lakh(median)})</span></div>
        <div><Store size={18} /><b>{COMPETITORS.filter((c) => c.source !== 'Company site').length}</b><span>Marketplace listings</span></div>
      </div>

      {/* How they charge */}
      <section className="card mk-card">
        <h2 className="mk-h2"><Lightbulb size={17} /> How they charge</h2>
        <div className="mk-models">
          {Object.entries(MODEL_INFO).map(([k, m]) => (
            <button key={k} type="button" className={'mk-model' + (model === k ? ' active' : '')}
              onClick={() => setModel(model === k ? 'All' : k)} title="Click to filter the list below">
              <b>{models[k] || 0}</b>
              <span>{m.label}</span>
              <small>{m.hint}</small>
            </button>
          ))}
        </div>
        <ul className="mk-insights">
          <li><b>Marketplace listings (IndiaMART / TradeIndia)</b> are small yearly licences of Rs 5,000 - 95,000, built for small shops (10 to 200 users). Prices are "excluding taxes" and usually have no unit.</li>
          <li><b>AMY Fintech and CK Tech</b> charge a licence plus yearly maintenance (about 12 - 21% of the licence at AMY). AMY prices by members and branches: Rs 24,000 for 300 members and 1 branch up to Rs 1,20,000 for unlimited.</li>
          <li><b>Low-end monthly SaaS</b> is Rs 2,000 - 5,000 per month (Hubco, Vector Nidhi). The Habile guide puts growing lenders at Rs 1 - 4 lakh per month plus Rs 5 - 15 lakh implementation.</li>
          <li><b>Almost everyone charges extras:</b> mobile apps (Rs 10,000 - 35,000), SMS, payment gateway, eKYC / CIBIL per report, customisation. Hosting is rarely priced on its own: only AMY lists a hosting upgrade (Rs 5,000 - 15,000 per year); the others fold it into the licence or maintenance.</li>
          <li><b>SquareNow (Kapiital Systems)</b> publishes no price. It says entry pricing is sized for small books and scales with AUM (loan book size), which is a different basis from users, branches or modules.</li>
          <li><b>More vendors like AMY (several modules + cloud):</b> IDSPay (JLG / SHG, field-agent tracking, offline collection, Android app, bureau, eKYC, cloud with backups), Jaguar Software India (native JLG / SHG, offline field app, cloud) and Finsta (LOS / LMS / core banking, gold, JLG / SHG, three apps) publish no prices. CloudHouse (Rs 16,500 + GST per branch, unlimited users) and TaxHint (from Rs 5,000) sell gold loan only. SB Creation starts at Rs 35,000 and prices by branches, agents and customers.</li>
          <li><b>Where we differ:</b> we pass real hosting cost monthly (server, database, storage, backup, map) and charge one-time fees per staff, branch, customer and module. The competitors above mostly sell a fixed licence.</li>
        </ul>
      </section>

      {/* Chart */}
      <section className="card mk-card">
        <h2 className="mk-h2"><BarChart3 size={17} /> First-year cost, cheapest published plan (excl. GST)</h2>
        <p className="mk-sub">Solid bar = cheapest plan. Light bar = dearest published plan. Licence + first-year maintenance, or 12 months of a monthly plan. Not like-for-like: plans differ in size.</p>
        <div className="mk-chart">
          {mine.map((m) => (
            <div className="mk-bar mk-bar-ours" key={m.label}>
              <span className="mk-bar-name">{m.label}<small>{m.sub}</small></span>
              <span className="mk-bar-track"><i style={{ width: (m.firstYear / chartMax) * 100 + '%' }} /></span>
              <span className="mk-bar-val">{lakh(m.firstYear)}</span>
            </div>
          ))}
          <div className="mk-chart-sep">Competitors</div>
          {sortedShown.map((c) => (
            <div className="mk-bar" key={c.id}>
              <span className="mk-bar-name">{c.name}</span>
              <span className="mk-bar-track">
                {c.top && <u style={{ width: (c.top / chartMax) * 100 + '%' }} />}
                <i style={{ width: (c.entry / chartMax) * 100 + '%' }} />
              </span>
              <span className="mk-bar-val">{lakh(c.entry)}{c.top ? ' - ' + lakh(c.top) : ''}</span>
            </div>
          ))}
        </div>
        <p className="mk-sub">Our figures are for first-year cost: monthly hosting x 12 + one-time charges, from the Calculator inputs. Our hosting is billed at cost, so our price grows with users and customers; most competitor prices do not.</p>
      </section>

      {/* Side-by-side comparison */}
      <section className="card mk-card">
        <h2 className="mk-h2"><Table2 size={17} /> Side-by-side comparison</h2>
        <p className="mk-sub">
          How each company charges, in one table. Green = included or clearly stated, amber = costs extra, grey = the page did not say. Scroll sideways to see every column.
        </p>
        <div className="mk-facts">
          <div><b>{count('mobile', 'yes')}</b><span>list mobile app support</span></div>
          <div><b>{count('mobile', 'paid')}</b><span>charge extra for the app</span></div>
          <div><b>{count('hosting', 'yes')}</b><span>mention hosting / cloud</span></div>
          <div><b>{count('demo', 'yes')}</b><span>offer a demo or trial</span></div>
          <div><b>{count('amc', 'paid')}</b><span>charge a yearly AMC</span></div>
          <div><b>{COMPETITORS.filter((c) => c.cmp?.tax?.l === 'no' || c.cmp?.tax?.l === 'yes').length}</b><span>state GST basis</span></div>
        </div>
        <div className="mk-matrix-bar">
          <label className="mk-check"><input type="checkbox" checked={onlyPriced} onChange={(e) => setOnlyPriced(e.target.checked)} /> Only companies with a price</label>
          <div className="mk-chips" role="radiogroup" aria-label="Sort">
            {[['order', 'List order'], ['price', 'Cheapest first'], ['name', 'A - Z']].map(([k, l]) => (
              <button key={k} type="button" role="radio" aria-checked={sortBy === k} className={sortBy === k ? 'active' : ''} onClick={() => setSortBy(k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="mk-matrix-wrap" tabIndex={0} aria-label="Comparison table, scrolls sideways">
          <table className="mk-matrix">
            <thead>
              <tr>
                <th className="mk-stick">Company</th>
                <th>First-year price</th>
                {MATRIX_COLS.map(([k, l]) => <th key={k}>{l}</th>)}
              </tr>
            </thead>
            <tbody>
              {[{ ...ours, isOurs: true }, ...matrixRows].map((c) => (
                <tr key={c.name} className={c.isOurs ? 'mk-ours-row' : ''}>
                  <th className="mk-stick" scope="row">
                    {c.name}
                    {!c.isOurs && <small>{MODEL_INFO[c.model].label}</small>}
                    {c.isOurs && <small>at your Calculator inputs</small>}
                  </th>
                  <td className="mk-price-cell">
                    {c.entry ? <>{lakh(c.entry)}{c.top ? <small> to {lakh(c.top)}</small> : null}</> : <span className="mk-dash">No price</span>}
                  </td>
                  {MATRIX_COLS.map(([k]) => {
                    const v = cell(c.cmp?.[k]);
                    return <td key={k} className={'mk-l-' + v.l}>{v.t}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mk-foot">Prices are first-year cost of the cheapest plan (small line = dearest published plan), excl. GST unless the Tax column says otherwise.</p>
      </section>

      {/* How price scales: users / branches / clients / modules */}
      <section className="card mk-card">
        <h2 className="mk-h2"><Users size={17} /> How they charge by users, branches, clients and modules</h2>
        <p className="mk-sub">
          Does the price change with the number of staff, branches, clients (members) or modules? Green = yes, the price or plan limit depends on it. Amber = priced as an extra. Grey = the page did not say. The last column is a first-year cost worked out from each company's published price list for the client size you set above. It is an estimate, not a real quote.
        </p>
        <div className="mk-live">
          <div className="mk-live-head"><SlidersHorizontal size={16} /> Change the client size - every company's price updates
            <small>Shared with your Quotation page.</small></div>
          <div className="mk-live-inputs">
            {[['users', 'Staff / users'], ['branches', 'Branches'], ['clients', 'Clients / members']].map(([k, l]) => (
              <label key={k} className="mk-in">
                <span>{l}</span>
                <input type="number" min="0" inputMode="numeric" value={size[k]} onChange={(e) => updateSize({ [k]: e.target.value })} />
              </label>
            ))}
          </div>
          <div className="mk-live-mods" role="group" aria-label="Modules">
            {MODULE_TOGGLES.map(([k, l]) => (
              <button key={k} type="button" aria-pressed={!!size[k]} className={size[k] ? 'on' : ''} onClick={() => updateSize({ [k]: !size[k] })}>
                {l}<em title="Companies whose page says they offer this">{COMPETITORS.filter(MOD_OFFER[k]).length}</em>
              </button>
            ))}
          </div>
          <div className="mk-live-filter">
            <label className="mk-check">
              <input type="checkbox" checked={filterMods} onChange={(e) => setFilterMods(e.target.checked)} /> Show only companies that offer the selected modules
            </label>
            <span className={filterMods && activeMods.length ? 'on' : ''}>
              {filterMods && activeMods.length
                ? `${shown.length} of ${COMPETITORS.length} companies offer: ${MODULE_TOGGLES.filter(([k]) => size[k]).map(([, l]) => l).join(' + ')}`
                : `All ${COMPETITORS.length} companies shown`}
            </span>
          </div>
          <div className="mk-live-sum">
            At <b>{sizeNum.users.toLocaleString('en-IN')}</b> staff, <b>{sizeNum.branches.toLocaleString('en-IN')}</b> branches and <b>{sizeNum.clients.toLocaleString('en-IN')}</b> clients,
            our first-year price is <b className="mk-ours-txt">{lakh(sarvamOurs.firstYear)}</b>.{' '}
            {liveRows.withNum.length > 0 && (
              <>Of the {liveRows.withNum.length} competitors with a figure, the cheapest is {lakh(estVal(liveRows.withNum[0]))} and the middle one is {lakh(liveMedian)}; we are{' '}
                <b>{sarvamOurs.firstYear >= liveMedian ? Math.round((sarvamOurs.firstYear / liveMedian - 1) * 100) + '% above' : Math.round((1 - sarvamOurs.firstYear / liveMedian) * 100) + '% below'}</b> the middle.</>
            )}
          </div>
          <div className="mk-chart mk-live-chart">
            <div className="mk-bar mk-bar-ours">
              <span className="mk-bar-name">Knock The Globe (us)<small>{sarvamOurs.plan} server</small></span>
              <span className="mk-bar-track"><i style={{ width: (sarvamOurs.firstYear / liveMax) * 100 + '%' }} /></span>
              <span className="mk-bar-val">{lakh(sarvamOurs.firstYear)}</span>
            </div>
            {shown.length === 0 && <div className="mk-empty">No company offers all of these modules together. Turn one off, or untick the filter.</div>}
            {liveRows.withNum.map((r) => (
              <div className="mk-bar mk-live-bar" key={r.name} title={r.note}>
                <span className="mk-bar-name">{r.name}<small>{r.plan}</small></span>
                <span className="mk-bar-track">
                  {r.high && <u style={{ width: Math.min(100, (r.high / liveMax) * 100) + '%' }} />}
                  <i style={{ width: (estVal(r) / liveMax) * 100 + '%' }} />
                </span>
                <span className="mk-bar-val">{lakh(estVal(r))}{r.high ? ' - ' + lakh(r.high) : ''}<em className={'mk-pill mk-pill-' + r.conf}>{r.conf === 'limits' ? 'fits' : r.conf === 'flat' ? 'listed' : 'quote'}</em></span>
              </div>
            ))}
            {liveRows.without.length > 0 && (
              <div className="mk-chart-sep">No figure: {liveRows.without.map((r) => r.name).join(', ')}</div>
            )}
          </div>
          <p className="mk-sub">Green "fits" = their stated plan limits cover this size. "listed" = one published price that does not change with size, so a large client may be quoted more. "quote" = their page says size needs a quote, or only a range is published. Light bar = top of the range.</p>
        </div>

        <div className="mk-facts mk-facts-4">
          <div><b>{COMPETITORS.filter((c) => c.scale?.users?.l === 'yes').length}</b><span>price or limit depends on users</span></div>
          <div><b>{COMPETITORS.filter((c) => c.scale?.branches?.l === 'yes').length}</b><span>price or limit depends on branches</span></div>
          <div><b>{COMPETITORS.filter((c) => c.scale?.clients?.l === 'yes').length}</b><span>price or limit depends on clients</span></div>
          <div><b>{COMPETITORS.filter((c) => ['yes', 'paid'].includes(c.scale?.modules?.l)).length}</b><span>price modules / add-ons separately</span></div>
        </div>
        <div className="mk-matrix-wrap" tabIndex={0} aria-label="Scaling comparison, scrolls sideways">
          <table className="mk-matrix">
            <thead>
              <tr>
                <th className="mk-stick">Company</th>
                {SCALE_COLS.map(([k, l]) => <th key={k}>{l}</th>)}
                <th>At your quote size (first year)</th>
              </tr>
            </thead>
            <tbody>
              {[{ name: 'Knock The Globe (us)', isOurs: true, scale: oursScale }, ...shown].map((c) => (
                <tr key={c.name} className={c.isOurs ? 'mk-ours-row' : ''}>
                  <th className="mk-stick" scope="row">
                    {c.name}
                    {!c.isOurs && <small>{MODEL_INFO[c.model].label}</small>}
                  </th>
                  {SCALE_COLS.map(([k]) => {
                    const x = cell(c.scale?.[k]);
                    return <td key={k} className={'mk-l-' + x.l}>{x.t}</td>;
                  })}
                  {(() => {
                    const e = c.isOurs ? { est: sarvamOurs.firstYear, conf: 'ours', note: oursScale.sarvam.t, plan: sarvamOurs.plan } : estimates[c.name];
                    return (
                      <td className={'mk-sarvam mk-conf-' + e.conf}>
                        {estVal(e) != null ? <b>{lakh(estVal(e))}{e.high ? ' - ' + lakh(e.high) : ''}</b> : <b className="mk-dash">Needs a quote</b>}
                        <small>{e.note}</small>
                        {e.conf === 'limits' && <i>plan limits cover this size</i>}
                        {e.conf === 'flat' && <i>one listed price, not size-based</i>}
                        {e.conf === 'quote' && <i>real price needs a quote</i>}
                        {e.conf === 'ours' && <i>excl. GST, your selected modules</i>}
                      </td>
                    );
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mk-foot">
          Takeaway: AMY is the only one that clearly prices by both branches and members (clients). CK Tech charges per extra branch, Habile's guide mentions per user or per loan account, and Varun and Softdew tie the price to a user band. Most others quote one flat figure with no limits, so the real price for a big client has to be asked for.
        </p>
      </section>

      {/* Server / web hosting + modules */}
      <section className="card mk-card">
        <h2 className="mk-h2"><Server size={17} /> Server / web hosting and modules: MFI, live tracking, jewel loan</h2>
        <p className="mk-sub">
          How each company handles hosting and these three modules, as their pages state them. Green = offered or included. Amber = costs extra. Grey = the page does not mention it. Our row uses the client size you set above.
        </p>
        <div className="mk-facts mk-facts-4">
          <div><b>{COMPETITORS.filter((c) => c.mods?.hosting?.l === 'yes').length}</b><span>say cloud / hosting is part of the service</span></div>
          <div><b>{COMPETITORS.filter((c) => c.mods?.mfi?.l === 'yes').length}</b><span>offer MFI features</span></div>
          <div><b>{COMPETITORS.filter((c) => ['yes', 'paid'].includes(c.mods?.tracking?.l)).length}</b><span>mention field / live tracking</span></div>
          <div><b>{COMPETITORS.filter((c) => ['yes', 'paid'].includes(c.mods?.jewel?.l)).length}</b><span>offer gold / jewel loan</span></div>
        </div>
        <div className="mk-matrix-wrap" tabIndex={0} aria-label="Hosting and modules comparison, scrolls sideways">
          <table className="mk-matrix">
            <thead>
              <tr>
                <th className="mk-stick">Company</th>
                {MOD_COLS.map(([k, l]) => <th key={k}>{l}</th>)}
              </tr>
            </thead>
            <tbody>
              {[{ name: 'Knock The Globe (us)', isOurs: true, mods: oursMods }, ...shown].map((c) => (
                <tr key={c.name} className={c.isOurs ? 'mk-ours-row' : ''}>
                  <th className="mk-stick" scope="row">
                    {c.name}
                    {!c.isOurs && <small>{MODEL_INFO[c.model].label}</small>}
                    {c.isOurs && <small>at your quote size</small>}
                  </th>
                  {MOD_COLS.map(([k]) => {
                    const x = cell(c.mods?.[k]);
                    return <td key={k} className={'mk-l-' + x.l}>{x.t}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mk-insights mk-mod-notes">
          <li><b>Hosting:</b> no competitor publishes a separate hosting price except AMY (included in yearly maintenance Rs 5,000 - 25,000, upgrade Rs 5,000 - 15,000). We show server, database, storage, backup and map as real monthly costs, which is why we move with size and they mostly do not.</li>
          <li><b>MFI:</b> mostly included as the core product. Only AMY and Hubco clearly say it is in the base plan; AMY limits the cheapest plan to group loans.</li>
          <li><b>Live tracking:</b> almost nobody sells it. Only the ADL Techno listing (Zetu / Green Apps) says "track field recovery executive", with no GPS detail and no separate price. AMY has a Rs 10,000 - 25,000 collection-tracking staff app. It is a differentiator for us, but it also brings the Google Maps cost.</li>
          <li><b>Jewel / gold loan:</b> CK Tech is built around it (from Rs 10,000 + Rs 6,000/yr). AMY includes it in NBFC plans. Softdew and the Genuine IT listing only name "gold loan" as a loan type. Habile's guide says it adds configuration cost with no figure.</li>
        </ul>
        <p className="mk-foot">Habile's guide page is branded "NBFC Software" and does not name Habile Technologies. Pages change; verify before quoting.</p>
      </section>

      {/* Company list */}
      <section className="card mk-card">
        <h2 className="mk-h2"><Globe size={17} /> Company pricing details</h2>
        <div className="mk-toolbar">
          <div className="search-box-wrap mk-search">
            <Search className="search-icon" size={16} />
            <input type="text" className="search-input" placeholder="Search company or price..." value={q}
              onChange={(e) => setQ(e.target.value)} aria-label="Search company" />
          </div>
          <div className="mk-chips" role="radiogroup" aria-label="Source">
            {SOURCES.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={source === s}
                className={source === s ? 'active' : ''} onClick={() => setSource(s)}>{s}</button>
            ))}
          </div>
        </div>
        <label className="mk-check mk-multi">
          <input type="checkbox" checked={multiOnly} onChange={(e) => setMultiOnly(e.target.checked)} /> Only companies with 2 or more modules (like AMY Fintech)
          <em>{shown.filter((c) => modCount(c) >= 2).length}</em>
        </label>
        {model !== 'All' && (
          <div className="mk-filter-note">Showing: {MODEL_INFO[model].label} <button type="button" onClick={() => setModel('All')}>clear</button></div>
        )}

        <div className="mk-list">
          {rows.length === 0 && <div className="mk-empty">No company matches.</div>}
          {rows.map((c) => (
            <article className={'mk-co' + (open === c.id ? ' open' : '')} key={c.id}>
              <button type="button" className="mk-co-head" onClick={() => setOpen(open === c.id ? null : c.id)} aria-expanded={open === c.id}>
                <span className="mk-no">{c.id}</span>
                <span className="mk-co-main">
                  <b>{c.name}</b>
                  <span className="mk-co-price">{c.headline}</span>
                </span>
                <span className="mk-co-tags">
                  <i className={'mk-badge mk-mc mk-mc-' + Math.min(modCount(c), 3)} title="MFI, live tracking, HR, mobile app, jewel loan - how many the page says it offers">{modCount(c)} of 5 modules</i>
                  <i className={'mk-badge mk-m-' + c.model.toLowerCase()}>{MODEL_INFO[c.model].label}</i>
                  <i className={'mk-badge mk-' + c.source.replace(/\W/g, '').toLowerCase()}>{c.source}</i>
                </span>
                <ChevronDown size={18} className="mk-chev" />
              </button>
              {open === c.id && (
                <div className="mk-co-body">
                  <ul>{c.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
                  {c.sameAs && <p className="mk-same">Same listing as {c.sameAs}.</p>}
                  <a className="mk-visit" href={c.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} /> Open pricing page ({c.host})
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
        <p className="mk-foot">
          Read from each page on 21 Nov 2026; prices change, so verify before quoting. Source list: server_price_calculation.xlsx. {rows.length} of {COMPETITORS.length} shown.
        </p>
      </section>
    </div>
  );
}
