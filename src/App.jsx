import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_RATES, calculate } from './pricing.js';

let FX = 85;
const inr = (n) =>
  '₹' +
  Math.round(n).toLocaleString('en-IN') +
  ' ($' +
  (n / FX).toLocaleString('en-US', { maximumFractionDigits: 0 }) +
  ')';

const loadQuotes = () => {
  try {
    return JSON.parse(localStorage.getItem('sp_quotes')) || [];
  } catch {
    return [];
  }
};

const loadRates = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('sp_rates')) || {};
    const plans = (saved.plans && saved.plans.length >= DEFAULT_RATES.plans.length)
      ? saved.plans
      : DEFAULT_RATES.plans;
    const dbPlans = (saved.dbPlans && saved.dbPlans.length >= DEFAULT_RATES.dbPlans.length)
      ? saved.dbPlans
      : DEFAULT_RATES.dbPlans;
    return { ...DEFAULT_RATES, ...saved, plans, dbPlans };
  } catch {
    return DEFAULT_RATES;
  }
};

const load = (k, d) => {
  try {
    return { ...d, ...JSON.parse(localStorage.getItem(k)) };
  } catch {
    return d;
  }
};

const START = {
  client: '',
  mode: 'separate',
  users: 10,
  branches: 2,
  clients: 500,
  backup: true,
  tracking: true,
  trackedUsers: 5,
  mfi: true,
};

const RATE_FIELDS = [
  ['usdToInr', 'USD → INR'],
  ['markupPct', 'Markup %'],
  ['yearDiscountPct', 'Yearly discount %'],
  ['setupFee', 'Setup fee'],
  ['gstPct', 'GST %'],
  ['perUser', 'Per user'],
  ['perBranch', 'Per branch'],
  ['perClient', 'Per client'],
  ['mapUsdPer1000', 'Map USD / 1000 loads'],
  ['mapLoadsPerUserPerDay', 'Map loads / user / day'],
  ['mbPerClient', 'MB per client (storage)'],
  ['spacesUsdPer250GB', 'Spaces USD / 250GB'],
  ['linodeBackupPct', 'Linode backup % of plan'],
];

export default function App() {
  const [inp, setInp] = useState(() => load('sp_inp', START));
  const [rates, setRates] = useState(loadRates);
  const [show, setShow] = useState(false);
  const [quotes, setQuotes] = useState(loadQuotes);
  const [search, setSearch] = useState('');

  FX = rates.usdToInr || 85;

  useEffect(() => {
    try {
      localStorage.setItem('sp_inp', JSON.stringify(inp));
      localStorage.setItem('sp_rates', JSON.stringify(rates));
      localStorage.setItem('sp_quotes', JSON.stringify(quotes));
    } catch {
      /* ignore */
    }
  }, [inp, rates, quotes]);

  useEffect(() => {
    if (inp.client && inp.client.trim()) {
      document.title = `Quote - ${inp.client.trim()}`;
    } else {
      document.title = 'Server Price Calculator';
    }
  }, [inp.client]);

  const saveQuote = () => {
    if (!inp.client.trim()) {
      alert('Enter a client name first');
      return;
    }
    const q = {
      id: Date.now(),
      date: new Date().toISOString(),
      inp,
      rates,
      monthly: res.monthly,
      yearly: res.yearly,
      plan: res.plan.name,
      dbPlan: res.dbPlan.name,
    };
    setQuotes([q, ...quotes]);
  };

  const openQuote = (q) => {
    setInp(q.inp);
    setRates(q.rates);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const delQuote = (id) => setQuotes(quotes.filter((q) => q.id !== id));

  const grouped = useMemo(() => {
    const g = {};
    quotes
      .filter((q) => q.inp.client.toLowerCase().includes(search.toLowerCase()))
      .forEach((q) => {
        (g[q.inp.client] = g[q.inp.client] || []).push(q);
      });
    return Object.entries(g);
  }, [quotes, search]);

  const res = useMemo(() => calculate({ ...inp, mode: 'separate' }, rates), [inp, rates]);

  const set = (k) => (e) => {
    const t = e.target;
    let val;
    if (t.type === 'checkbox') {
      val = t.checked;
    } else if (t.type === 'number') {
      val = t.value === '' ? '' : Math.max(0, +t.value);
    } else {
      val = t.value;
    }
    setInp((prev) => ({ ...prev, [k]: val }));
  };

  const INFRA_KEYS = ['linode', 'linodeBackup', 'db', 'storage', 'map'];
  const toggleInfra = (k) =>
    setInp({ ...inp, infraOff: { ...inp.infraOff, [k]: !(inp.infraOff && inp.infraOff[k]) } });
  const setAllInfra = (enabled) =>
    setInp({ ...inp, infraOff: Object.fromEntries(INFRA_KEYS.map((k) => [k, !enabled])) });

  const rate = (k) => (e) => setRates({ ...rates, [k]: +e.target.value });
  const fee = (k) => (e) =>
    setRates({ ...rates, moduleFee: { ...rates.moduleFee, [k]: +e.target.value } });

  return (
    <div className="app-wrapper">
      {/* Page Header */}
      <header className="app-header">
        <div className="header-icon-box" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
            <line x1="6" y1="6" x2="6.01" y2="6"></line>
            <line x1="6" y1="18" x2="6.01" y2="18"></line>
          </svg>
        </div>
        <div className="header-text">
          <h1>Server Price Calculator</h1>
          <p>Quote hosting + service price for a new client</p>
        </div>
      </header>

      {/* Main 2-Column Grid */}
      <div className="main-grid">
        {/* Left: Client Configuration */}
        <section className="card input">
          <div className="section-title">
            <span>Client Configuration</span>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="client-name">
              Client name
            </label>
            <input
              id="client-name"
              className="input-box"
              value={inp.client}
              onChange={set('client')}
              placeholder="e.g. ABC Finance"
            />
          </div>

          {/* Users, Branches, Clients Metric Cards */}
          <div className="field-group">
            <label className="field-label">Scale & Capacity</label>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span className="metric-label">Users</span>
                </div>
                <input
                  type="number"
                  min="0"
                  className="metric-input"
                  value={inp.users}
                  onChange={set('users')}
                />
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  <span className="metric-label">Branches</span>
                </div>
                <input
                  type="number"
                  min="0"
                  className="metric-input"
                  value={inp.branches}
                  onChange={set('branches')}
                />
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="metric-label">Clients</span>
                </div>
                <input
                  type="number"
                  min="0"
                  className="metric-input"
                  value={inp.clients}
                  onChange={set('clients')}
                />
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="field-group">
            <div className="section-title" style={{ marginTop: '12px' }}>
              <span>Modules</span>
            </div>
            <div className="modules-container">
              {/* Server backup */}
              <label className={`module-toggle-card ${inp.backup ? 'active' : ''}`}>
                <div className="module-info">
                  <div className="module-icon-wrap">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                  </div>
                  <div>
                    <span className="module-title">Server backup</span>
                    <span className="module-hint">Automated retention & snapshots</span>
                  </div>
                </div>
                <span className="switch">
                  <input type="checkbox" checked={inp.backup} onChange={set('backup')} />
                  <span className="slider"></span>
                </span>
              </label>

              {/* Live tracking */}
              <label className={`module-toggle-card ${inp.tracking ? 'active' : ''}`}>
                <div className="module-info">
                  <div className="module-icon-wrap">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                    </svg>
                  </div>
                  <div>
                    <span className="module-title">Live tracking (adds map charge)</span>
                    <span className="module-hint">Location tracking and route history</span>
                  </div>
                </div>
                <span className="switch">
                  <input type="checkbox" checked={inp.tracking} onChange={set('tracking')} />
                  <span className="slider"></span>
                </span>
              </label>

              {/* Users tracked live (sub-field) */}
              {inp.tracking && (
                <div className="sub-input-wrap">
                  <label className="field-label" htmlFor="tracked-users-input">
                    Users tracked live
                  </label>
                  <input
                    id="tracked-users-input"
                    type="number"
                    min="0"
                    className="input-box"
                    value={inp.trackedUsers}
                    onChange={set('trackedUsers')}
                  />
                </div>
              )}

              {/* MFI module */}
              <label className={`module-toggle-card ${inp.mfi ? 'active' : ''}`}>
                <div className="module-info">
                  <div className="module-icon-wrap">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  </div>
                  <div>
                    <span className="module-title">MFI module</span>
                    <span className="module-hint">Loan cycles, collections & center meetings</span>
                  </div>
                </div>
                <span className="switch">
                  <input type="checkbox" checked={inp.mfi} onChange={set('mfi')} />
                  <span className="slider"></span>
                </span>
              </label>
            </div>
          </div>

          <button
            type="button"
            className="btn-toggle-rates"
            onClick={() => setShow(!show)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>{show ? 'Hide' : 'Edit'} rates &amp; assumptions</span>
          </button>
        </section>

        {/* Right: Quote Summary */}
        <section className="card result">
          <div className="quote-top-bar">
            <div className="quote-title-group">
              <div className="quote-print-brand">Server Price Calculator</div>
              <h2 className="quote-client-name">{inp.client ? `Quote for: ${inp.client}` : 'Quote'}</h2>
            </div>
            <div className="quote-print-date">
              Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>

          {/* Prominent Dual Pricing Cards */}
          <div className="pricing-dual-grid">
            <div className="price-box price-box-monthly">
              <div className="price-box-header">
                <span className="price-box-title">Monthly</span>
              </div>
              <div className="price-box-val">{inr(res.monthlyTotal)}</div>
              <small>incl. {rates.gstPct}% GST</small>
            </div>

            <div className="price-box price-box-yearly">
              <div className="price-box-header">
                <span className="price-box-title">Yearly</span>
                <span className="price-discount-tag">-{rates.yearDiscountPct}%</span>
              </div>
              <div className="price-box-val">{inr(res.yearlyTotal)}</div>
              <small>incl. {rates.gstPct}% GST</small>
            </div>
          </div>

          {/* Recommended Server Strip */}
          <div className="rec-strip">
            <span className="rec-check-badge" aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
            <span>
              Recommended: <b>{res.plan.name}</b> (Linode) + <b>{res.dbPlan.name}</b> (DigitalOcean)
            </span>
          </div>

          {/* Cost Breakdown Table */}
          <div className="breakdown-table-wrapper">
            <table className="breakdown-table">
              <tbody>
                {res.lines.map(([k, n, v]) => {
                  const isOff = !!(inp.infraOff && inp.infraOff[k]);
                  return (
                    <tr key={k} className={isOff ? 'infra-off' : ''}>
                      <td>
                        <label className="infra-check">
                          <input type="checkbox" checked={!isOff} onChange={() => toggleInfra(k)} />
                          <span>{n}</span>
                        </label>
                      </td>
                      <td>{isOff ? 'Off' : inr(v)}</td>
                    </tr>
                  );
                })}
                <tr className="sub-row">
                  <td>
                    <span>Infrastructure cost</span>{' '}
                    <button type="button" className="btn-infra-all" onClick={() => setAllInfra(true)}>
                      All on
                    </button>
                    <button type="button" className="btn-infra-all" onClick={() => setAllInfra(false)}>
                      All off
                    </button>
                  </td>
                  <td>{inr(res.infra)}</td>
                </tr>
                <tr className="total-monthly-row">
                  <td>Monthly price (server only, excl. GST)</td>
                  <td>{inr(res.monthly)}</td>
                </tr>
                <tr>
                  <td>Yearly without discount</td>
                  <td>{inr(res.yearGross)}</td>
                </tr>
                <tr>
                  <td>One-time: Markup ({rates.markupPct}%)</td>
                  <td>{inr(res.markup)}</td>
                </tr>
                <tr>
                  <td>One-time: User / branch / client / module fees</td>
                  <td>{inr(res.fees)}</td>
                </tr>
                <tr className="setup-fee-row">
                  <td>
                    <span>One-time setup</span>
                    <span className="badge-setup-tag">Setup</span>
                  </td>
                  <td>{inr(rates.setupFee)}</td>
                </tr>
                <tr className="total-monthly-row">
                  <td>Total one-time payment (excl. GST)</td>
                  <td>{inr(res.oneTimeBase)}</td>
                </tr>
                <tr>
                  <td>GST ({rates.gstPct}%) on monthly</td>
                  <td>{inr(res.gst.monthly)}</td>
                </tr>
                <tr>
                  <td>GST ({rates.gstPct}%) on one-time</td>
                  <td>{inr(res.gst.oneTime)}</td>
                </tr>
                <tr className="total-monthly-row">
                  <td>Monthly payable (incl. GST)</td>
                  <td>{inr(res.monthlyTotal)}</td>
                </tr>
                <tr className="total-monthly-row">
                  <td>One-time payable (incl. GST)</td>
                  <td>{inr(res.oneTimeTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Margin Callout Box */}
          <div className="margin-callout">
            <div className="margin-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
            <div>
              Your margin (one-time): <strong className="highlight-green">{inr(res.profit)}</strong>.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons-bar">
            <button type="button" className="btn-primary" onClick={saveQuote}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>Save quote</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => window.print()}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              <span>Print quote</span>
            </button>
          </div>
        </section>
      </div>

      {/* Saved Quotes Section */}
      <section className="card saved saved-section">
        <div className="saved-header">
          <div className="saved-title-group">
            <div className="section-title" style={{ margin: 0 }}>
              <span>Saved quotes</span>
            </div>
            <span className="saved-count-pill">{quotes.length}</span>
          </div>
          <div className="search-box-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {grouped.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p>No saved quotes yet.</p>
          </div>
        ) : (
          <div className="saved-groups-container">
            {grouped.map(([client, list]) => (
              <div key={client} className="saved-client-card">
                <div className="saved-client-header">
                  <span className="saved-client-name">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    {client}
                  </span>
                  <span className="saved-count-pill">{list.length} quote{list.length > 1 ? 's' : ''}</span>
                </div>
                <table className="saved-items-table">
                  <tbody>
                    {list.map((q) => (
                      <tr key={q.id}>
                        <td className="saved-details-cell">
                          <span className="saved-date">{new Date(q.date).toLocaleDateString()}</span>
                          <span className="saved-specs">
                            {q.inp.users}u / {q.inp.branches}b / {q.inp.clients}c
                          </span>
                          <span className="saved-plan">· {q.plan}</span>
                        </td>
                        <td className="saved-price-cell">
                          <b>{inr(q.monthly)}/mo</b>
                          <small>{inr(q.yearly)}/yr</small>
                        </td>
                        <td className="saved-actions-cell">
                          <button
                            type="button"
                            className="btn-action-open"
                            onClick={() => openQuote(q)}
                            title="Open quote & print/save PDF"
                          >
                            Open PDF
                          </button>
                          <button
                            type="button"
                            className="btn-action-del"
                            onClick={() => delQuote(q.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Rates & Assumptions Drawer/Card */}
      {show && (
        <section className="card rates rates-section">
          <div className="section-title">
            <span>Rates (INR unless noted)</span>
          </div>
          <div className="rates-grid">
            {RATE_FIELDS.map(([k, label]) => (
              <div key={k} className="rates-field">
                <label htmlFor={`rate-${k}`}>{label}</label>
                <input
                  id={`rate-${k}`}
                  type="number"
                  value={rates[k]}
                  onChange={rate(k)}
                />
              </div>
            ))}
            <div className="rates-field">
              <label htmlFor="rate-fee-backup">Backup fee</label>
              <input
                id="rate-fee-backup"
                type="number"
                value={rates.moduleFee.backup}
                onChange={fee('backup')}
              />
            </div>
            <div className="rates-field">
              <label htmlFor="rate-fee-tracking">Tracking fee</label>
              <input
                id="rate-fee-tracking"
                type="number"
                value={rates.moduleFee.tracking}
                onChange={fee('tracking')}
              />
            </div>
            <div className="rates-field">
              <label htmlFor="rate-fee-mfi">MFI fee</label>
              <input
                id="rate-fee-mfi"
                type="number"
                value={rates.moduleFee.mfi}
                onChange={fee('mfi')}
              />
            </div>
          </div>
          <div className="rates-footer">
            <button
              type="button"
              className="btn-reset-rates"
              onClick={() => setRates(DEFAULT_RATES)}
            >
              Reset to defaults
            </button>
            <p className="rates-note">
              Server plan sizes/prices live in <code>src/pricing.js</code> (Linode plans, DigitalOcean DB plans).
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
