import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_RATES, calculate } from './pricing.js';

let FX = 85;
const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN') + ' ($' + (n / FX).toLocaleString('en-US', { maximumFractionDigits: 0 }) + ')';
const loadQuotes = () => {
  try { return JSON.parse(localStorage.getItem('sp_quotes')) || []; } catch { return []; }
};
const load = (k, d) => {
  try { return { ...d, ...JSON.parse(localStorage.getItem(k)) }; } catch { return d; }
};

const START = { client: '', mode: 'separate', users: 10, branches: 2, clients: 500,
  backup: true, tracking: true, trackedUsers: 5, mfi: true };

const RATE_FIELDS = [
  ['usdToInr', 'USD → INR'], ['markupPct', 'Markup %'], ['yearDiscountPct', 'Yearly discount %'],
  ['setupFee', 'Setup fee'], ['perUser', 'Per user'], ['perBranch', 'Per branch'], ['perClient', 'Per client'],
  ['sharedTenants', 'Shared: tenants per server'], ['mapUsdPer1000', 'Map USD / 1000 loads'],
  ['mapLoadsPerUserPerDay', 'Map loads / user / day'], ['mbPerClient', 'MB per client (storage)'],
  ['spacesUsdPer250GB', 'Spaces USD / 250GB'], ['linodeBackupPct', 'Linode backup % of plan'],
];

export default function App() {
  const [inp, setInp] = useState(() => load('sp_inp', START));
  const [rates, setRates] = useState(() => load('sp_rates', DEFAULT_RATES));
  const [show, setShow] = useState(false);
  const [quotes, setQuotes] = useState(loadQuotes);
  const [search, setSearch] = useState('');
  FX = rates.usdToInr || 85;
  useEffect(() => {
    try {
      localStorage.setItem('sp_inp', JSON.stringify(inp));
      localStorage.setItem('sp_rates', JSON.stringify(rates));
      localStorage.setItem('sp_quotes', JSON.stringify(quotes));
    } catch { /* ignore */ }
  }, [inp, rates, quotes]);

  const saveQuote = () => {
    if (!inp.client.trim()) { alert('Enter a client name first'); return; }
    const q = { id: Date.now(), date: new Date().toISOString(), inp, rates, monthly: res.monthly, yearly: res.yearly,
      plan: res.plan.name, dbPlan: res.dbPlan.name };
    setQuotes([q, ...quotes]);
  };
  const openQuote = (q) => { setInp(q.inp); setRates(q.rates); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const delQuote = (id) => setQuotes(quotes.filter((q) => q.id !== id));
  const grouped = useMemo(() => {
    const g = {};
    quotes.filter((q) => q.inp.client.toLowerCase().includes(search.toLowerCase()))
      .forEach((q) => { (g[q.inp.client] = g[q.inp.client] || []).push(q); });
    return Object.entries(g);
  }, [quotes, search]);

  const res = useMemo(() => calculate(inp, rates), [inp, rates]);
  const other = useMemo(
    () => calculate({ ...inp, mode: inp.mode === 'shared' ? 'separate' : 'shared' }, rates),
    [inp, rates]
  );

  const set = (k) => (e) => {
    const t = e.target;
    setInp({ ...inp, [k]: t.type === 'checkbox' ? t.checked : t.type === 'number' ? Math.max(0, +t.value) : t.value });
  };
  const rate = (k) => (e) => setRates({ ...rates, [k]: +e.target.value });
  const fee = (k) => (e) => setRates({ ...rates, moduleFee: { ...rates.moduleFee, [k]: +e.target.value } });

  return (
    <div className="wrap">
      <header><h1>Server Price Calculator</h1><p>Quote hosting + service price for a new client</p></header>
      <div className="grid">
        <section className="card input">
          <h2>Client</h2>
          <label>Client name<input value={inp.client} onChange={set('client')} placeholder="e.g. ABC Finance" /></label>
          <label>Server type
            <select value={inp.mode} onChange={set('mode')}>
              <option value="separate">Individual (dedicated server)</option>
              <option value="shared">Shared (multi-tenant)</option>
            </select>
          </label>
          <div className="row3">
            <label>Users<input type="number" value={inp.users} onChange={set('users')} /></label>
            <label>Branches<input type="number" value={inp.branches} onChange={set('branches')} /></label>
            <label>Clients<input type="number" value={inp.clients} onChange={set('clients')} /></label>
          </div>
          <h2>Modules</h2>
          <label className="chk"><input type="checkbox" checked={inp.backup} onChange={set('backup')} /> Server backup</label>
          <label className="chk"><input type="checkbox" checked={inp.tracking} onChange={set('tracking')} /> Live tracking (adds map charge)</label>
          {inp.tracking && <label>Users tracked live<input type="number" value={inp.trackedUsers} onChange={set('trackedUsers')} /></label>}
          <label className="chk"><input type="checkbox" checked={inp.mfi} onChange={set('mfi')} /> MFI module</label>
          <button className="link" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Edit'} rates &amp; assumptions</button>
        </section>

        <section className="card result">
          <h2>{inp.client || 'Quote'} <span className="tag">{inp.mode === 'shared' ? 'Shared' : 'Individual'}</span></h2>
          <div className="big">
            <div><small>Monthly</small><b>{inr(res.monthly)}</b></div>
            <div><small>Yearly (-{rates.yearDiscountPct}%)</small><b>{inr(res.yearly)}</b></div>
          </div>
          <p className="rec">✅ Recommended: <b>{res.plan.name}</b> (Linode) + <b>{res.dbPlan.name}</b> (DigitalOcean)</p>
          <table><tbody>
            {res.lines.map(([n, v]) => <tr key={n}><td>{n}</td><td>{inr(v)}</td></tr>)}
            <tr className="sub"><td>Infrastructure cost</td><td>{inr(res.infra)}</td></tr>
            <tr><td>Markup ({rates.markupPct}%)</td><td>{inr(res.markup)}</td></tr>
            <tr><td>User / branch / client / module fees</td><td>{inr(res.fees)}</td></tr>
            <tr className="tot"><td>Monthly price</td><td>{inr(res.monthly)}</td></tr>
            <tr><td>Yearly without discount</td><td>{inr(res.yearGross)}</td></tr>
            <tr><td>One-time setup</td><td>{inr(rates.setupFee)}</td></tr>
          </tbody></table>
          <p className="note">Your margin: {inr(res.profit)}/month. {inp.mode === 'separate' ? 'Shared' : 'Individual'} would be {inr(other.monthly)}/month.</p>
          <button onClick={saveQuote}>Save quote</button>{' '}
          <button className="link" onClick={() => window.print()}>Print / Save PDF</button>
        </section>
      </div>

      <section className="card saved">
        <h2>Saved quotes ({quotes.length})</h2>
        <input placeholder="Search client..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {grouped.length === 0 && <p className="note">No saved quotes yet.</p>}
        {grouped.map(([client, list]) => (
          <div key={client} className="grp">
            <h3>{client}</h3>
            <table><tbody>
              {list.map((q) => (
                <tr key={q.id}>
                  <td>{new Date(q.date).toLocaleDateString()} · {q.inp.mode === 'shared' ? 'Shared' : 'Individual'} · {q.inp.users}u/{q.inp.branches}b/{q.inp.clients}c · {q.plan}</td>
                  <td>{inr(q.monthly)}/mo<br /><small>{inr(q.yearly)}/yr</small></td>
                  <td className="act"><button className="link" onClick={() => openQuote(q)}>Open</button><button className="link" onClick={() => delQuote(q.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody></table>
          </div>
        ))}
      </section>

      {show && (
        <section className="card rates">
          <h2>Rates (INR unless noted)</h2>
          <div className="row4">
            {RATE_FIELDS.map(([k, label]) => (
              <label key={k}>{label}<input type="number" value={rates[k]} onChange={rate(k)} /></label>
            ))}
            <label>Backup fee<input type="number" value={rates.moduleFee.backup} onChange={fee('backup')} /></label>
            <label>Tracking fee<input type="number" value={rates.moduleFee.tracking} onChange={fee('tracking')} /></label>
            <label>MFI fee<input type="number" value={rates.moduleFee.mfi} onChange={fee('mfi')} /></label>
          </div>
          <button className="link" onClick={() => setRates(DEFAULT_RATES)}>Reset to defaults</button>
          <p className="note">Server plan sizes/prices live in <code>src/pricing.js</code> (Linode plans, DigitalOcean DB plans).</p>
        </section>
      )}
    </div>
  );
}
