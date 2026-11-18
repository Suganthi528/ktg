import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_RATES, calculate } from './pricing.js';

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
  overrides: {},
  textOverrides: {},
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

const loadInputs = () => {
  try {
    return { ...START, ...JSON.parse(localStorage.getItem('sp_inp')) };
  } catch {
    return START;
  }
};

const loadQuotes = () => {
  try {
    return JSON.parse(localStorage.getItem('sp_quotes')) || [];
  } catch {
    return [];
  }
};

function EditableAmount({ value, overrideKey, overrides, onSetOverride, onClearOverride, format, className = '' }) {
  const [editing, setEditing] = useState(false);
  const [tempVal, setTempVal] = useState('');

  const startEdit = (e) => {
    e.stopPropagation();
    setTempVal(Math.round(value));
    setEditing(true);
  };

  const save = () => {
    setEditing(false);
    if (tempVal === '' || isNaN(tempVal)) {
      onClearOverride(overrideKey);
    } else {
      onSetOverride(overrideKey, Math.max(0, Math.round(Number(tempVal))));
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      save();
    } else if (e.key === 'Escape') {
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <span className="editable-amount-wrap" onClick={(e) => e.stopPropagation()}>
        <input
          type="number"
          autoFocus
          className="editable-amount-input"
          value={tempVal}
          onChange={(e) => setTempVal(e.target.value)}
          onBlur={save}
          onKeyDown={onKeyDown}
        />
        <button type="button" className="btn-editable-save" onClick={save} title="Save amount">✓</button>
      </span>
    );
  }

  return (
    <span
      className={`editable-amount ${className}`}
      onClick={startEdit}
      title="Click to edit amount"
    >
      <span className="editable-amount-val">{format ? format(value) : value}</span>
    </span>
  );
}

function EditableText({ text, textKey, textOverrides, onSetTextOverride, onClearTextOverride, className = '' }) {
  const [editing, setEditing] = useState(false);
  const isOverridden = textOverrides && textOverrides[textKey] !== undefined;
  const currentVal = isOverridden ? textOverrides[textKey] : text;
  const [tempVal, setTempVal] = useState(currentVal);

  const startEdit = (e) => {
    e.stopPropagation();
    setTempVal(currentVal);
    setEditing(true);
  };

  const save = () => {
    setEditing(false);
    if (!tempVal || tempVal.trim() === '' || tempVal.trim() === text) {
      onClearTextOverride(textKey);
    } else {
      onSetTextOverride(textKey, tempVal.trim());
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      save();
    } else if (e.key === 'Escape') {
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <span className="editable-text-wrap" onClick={(e) => e.stopPropagation()}>
        <input
          type="text"
          autoFocus
          className="editable-text-input"
          value={tempVal}
          onChange={(e) => setTempVal(e.target.value)}
          onBlur={save}
          onKeyDown={onKeyDown}
        />
        <button type="button" className="btn-editable-save" onClick={save} title="Save text">✓</button>
      </span>
    );
  }

  return (
    <span
      className={`editable-text ${isOverridden ? 'is-overridden' : ''} ${className}`}
      onClick={startEdit}
      title="Click to edit text"
    >
      <span className="editable-text-val">{currentVal}</span>
    </span>
  );
}

export default function CustomerView() {
  const [inp, setInp] = useState(loadInputs);
  const [rates, setRates] = useState(loadRates);
  const [quotes, setQuotes] = useState(loadQuotes);
  const [search, setSearch] = useState('');
  const [activeQuoteId, setActiveQuoteId] = useState(null);

  const fx = rates.usdToInr || 85;
  const inr = (n) =>
    '₹' +
    Math.round(n).toLocaleString('en-IN') +
    ' ($' +
    (n / fx).toLocaleString('en-US', { maximumFractionDigits: 0 }) +
    ')';

  // Always compute quote with identical inputs and rates as calculator
  const res = useMemo(
    () => calculate({ ...inp, backup: inp.backup ?? true, mfi: inp.mfi ?? true, mode: 'separate' }, rates),
    [inp, rates]
  );

  useEffect(() => {
    try {
      localStorage.setItem('sp_inp', JSON.stringify(inp));
    } catch {
      /* ignore */
    }
  }, [inp]);

  useEffect(() => {
    try {
      localStorage.setItem('sp_rates', JSON.stringify(rates));
    } catch {
      /* ignore */
    }
  }, [rates]);

  useEffect(() => {
    try {
      localStorage.setItem('sp_quotes', JSON.stringify(quotes));
    } catch {
      /* ignore */
    }
  }, [quotes]);

  useEffect(() => {
    if (inp.client && inp.client.trim()) {
      document.title = `Customer Quote - ${inp.client.trim()}`;
    } else {
      document.title = 'Customer Quotation';
    }
  }, [inp.client]);

  // Keep synced when returning from Calculator tab or window
  useEffect(() => {
    const syncFromStorage = () => {
      setInp(loadInputs());
      setRates(loadRates());
    };
    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('focus', syncFromStorage);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('focus', syncFromStorage);
    };
  }, []);

  const getText = (defaultText, key) =>
    inp.textOverrides && inp.textOverrides[key] !== undefined
      ? inp.textOverrides[key]
      : defaultText;

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
    setActiveQuoteId(null);
    setInp((prev) => ({ ...prev, [k]: val }));
  };

  const setOverride = (k, v) => {
    setActiveQuoteId(null);
    setInp((prev) => ({
      ...prev,
      overrides: {
        ...(prev.overrides || {}),
        [k]: v,
      },
    }));
  };

  const clearOverride = (k) => {
    setActiveQuoteId(null);
    setInp((prev) => {
      const next = { ...(prev.overrides || {}) };
      delete next[k];
      return {
        ...prev,
        overrides: next,
      };
    });
  };

  const clearAllOverrides = () => {
    setActiveQuoteId(null);
    setInp((prev) => ({
      ...prev,
      overrides: {},
      textOverrides: {},
    }));
  };

  const setTextOverride = (k, v) => {
    setActiveQuoteId(null);
    setInp((prev) => ({
      ...prev,
      textOverrides: {
        ...(prev.textOverrides || {}),
        [k]: v,
      },
    }));
  };

  const clearTextOverride = (k) => {
    setActiveQuoteId(null);
    setInp((prev) => {
      const next = { ...(prev.textOverrides || {}) };
      delete next[k];
      return {
        ...prev,
        textOverrides: next,
      };
    });
  };

  const loadQuoteForEdit = (q) => {
    if (!q) return;
    const nextInp = { ...START, ...(q.inp || {}) };
    setInp(nextInp);
    try {
      localStorage.setItem('sp_inp', JSON.stringify(nextInp));
    } catch {
      /* ignore */
    }

    if (q.rates) {
      setRates(q.rates);
      try {
        localStorage.setItem('sp_rates', JSON.stringify(q.rates));
      } catch {
        /* ignore */
      }
    }

    setActiveQuoteId(q.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const saveQuote = () => {
    if (!inp.client || !inp.client.trim()) {
      alert('Please enter a Client Name first to save this quotation.');
      return;
    }
    const q = {
      id: Date.now(),
      date: new Date().toISOString(),
      inp,
      rates,
      monthly: res.monthlyTotal,
      yearly: res.yearlyTotal,
      plan: res.plan.name,
      dbPlan: res.dbPlan.name,
    };
    setQuotes([q, ...quotes]);
    setActiveQuoteId(q.id);
    alert(`Quotation for "${inp.client.trim()}" saved successfully.`);
  };

  const openQuote = (q) => {
    if (!q) return;
    const nextInp = { ...START, ...(q.inp || {}) };
    setInp(nextInp);
    try {
      localStorage.setItem('sp_inp', JSON.stringify(nextInp));
    } catch {
      /* ignore */
    }

    if (q.rates) {
      setRates(q.rates);
      try {
        localStorage.setItem('sp_rates', JSON.stringify(q.rates));
      } catch {
        /* ignore */
      }
    }

    setActiveQuoteId(q.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Open print / export PDF dialog for the quotation
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const delQuote = (id) => {
    setQuotes(quotes.filter((q) => q.id !== id));
    if (activeQuoteId === id) setActiveQuoteId(null);
  };

  const activeQuote = quotes.find((q) => q.id === activeQuoteId);
  const quoteDate = activeQuote?.date ? new Date(activeQuote.date) : new Date();

  const grouped = useMemo(() => {
    const g = {};
    quotes
      .filter((q) => q.inp?.client?.toLowerCase().includes(search.toLowerCase()))
      .forEach((q) => {
        const c = q.inp?.client || 'Untitled';
        (g[c] = g[c] || []).push(q);
      });
    return Object.entries(g);
  }, [quotes, search]);

  return (
    <div className="app-wrapper customer-view-page">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-icon-box" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <div className="header-text">
          <h1>Customer Quotation View</h1>
          <p>Client-facing presentation quote with internal supplier details omitted</p>
        </div>
      </header>

      {/* Main 2-Column Responsive Layout - Equal Width Columns */}
      <div className="main-grid calculator-main-grid customer-main-grid">
        {/* Left Column: Client Parameters & Saved Quotes */}
        <div className="calculator-col calculator-left-col">
          <section className="card input">
            <div className="section-title">
              <span>Client &amp; Service Scope</span>
            </div>

            {/* Client Name */}
            <div className="field-group">
              <label className="field-label" htmlFor="cust-client-name">
                Client Name <span className="req">*</span>
              </label>
              <input
                id="cust-client-name"
                type="text"
                className="input-box client-name-input"
                placeholder="e.g. Acme Microfinance Ltd"
                value={inp.client}
                onChange={set('client')}
              />
            </div>

            {/* Capacity Scale Metrics */}
            <div className="field-group">
              <div className="section-title" style={{ marginTop: '4px' }}>
                <span>Scale Requirements</span>
              </div>
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

            {/* Optional Add-on Modules */}
            <div className="field-group modules-field-group">
              <div className="section-title" style={{ marginTop: '8px' }}>
                <span>Add-on Modules</span>
              </div>
              <div className="modules-container">
                {/* Live tracking toggle */}
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
                    <input type="checkbox" checked={!!inp.tracking} onChange={set('tracking')} />
                    <span className="slider"></span>
                  </span>
                </label>

                {/* Users tracked live (sub-field) */}
                {inp.tracking && (
                  <div className="sub-input-wrap">
                    <label className="field-label" htmlFor="cust-tracked-users">
                      Users tracked live
                    </label>
                    <input
                      id="cust-tracked-users"
                      type="number"
                      min="0"
                      className="input-box"
                      value={inp.trackedUsers}
                      onChange={set('trackedUsers')}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Saved Quotes Section - Inside Left Column */}
          <section className="card saved saved-section">
            <div className="saved-header">
              <div className="saved-title-group">
                <div className="section-title" style={{ margin: 0 }}>
                  <span>Saved Quotes</span>
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
                          <tr key={q.id} style={activeQuoteId === q.id ? { backgroundColor: '#f0fdfa' } : undefined}>
                            <td className="saved-details-cell">
                              <span className="saved-date">{new Date(q.date).toLocaleDateString()}</span>
                              <span className="saved-specs">
                                {q.inp?.users ?? 0}u / {q.inp?.branches ?? 0}b / {q.inp?.clients ?? 0}c
                              </span>
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
        </div>

        {/* Right Column: Customer Quotation Card */}
        <div className="calculator-col calculator-right-col">
          <section className="card result customer-quote-card">
            {/* Top Bar with Client & Date */}
            <div className="quote-top-bar">
              <div className="quote-title-group">
                <div className="quote-print-brand">Customer Quotation</div>
                <h2 className="quote-client-name">
                  {inp.client && inp.client.trim() ? `Quote for: ${inp.client.trim()}` : 'Quotation'}
                </h2>
              </div>
              <div className="quote-top-right">
                {(Object.keys(inp.overrides || {}).length > 0 || Object.keys(inp.textOverrides || {}).length > 0) && (
                  <button
                    type="button"
                    className="btn-reset-overrides"
                    onClick={clearAllOverrides}
                    title="Reset all custom edits back to formula"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                    <span>Reset custom edits</span>
                  </button>
                )}
                <div className="quote-print-date">
                  Date: {quoteDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Prominent Dual Pricing Cards */}
            <div className="pricing-dual-grid">
              <div className="price-box price-box-monthly">
                <div className="price-box-header">
                  <span className="price-box-title">Monthly</span>
                </div>
                <div className="price-box-val">
                  <EditableAmount
                    value={res.monthlyTotal}
                    overrideKey="monthlyTotal"
                    overrides={inp.overrides}
                    onSetOverride={setOverride}
                    onClearOverride={clearOverride}
                    format={inr}
                  />
                </div>
                <small>incl. {rates.gstPct}% GST</small>
              </div>

              <div className="price-box price-box-yearly">
                <div className="price-box-header">
                  <span className="price-box-title">Yearly</span>
                  <span className="price-discount-tag">-{rates.yearDiscountPct}%</span>
                </div>
                <div className="price-box-val">
                  <EditableAmount
                    value={res.yearlyTotal}
                    overrideKey="yearlyTotal"
                    overrides={inp.overrides}
                    onSetOverride={setOverride}
                    onClearOverride={clearOverride}
                    format={inr}
                  />
                </div>
                <small>incl. {rates.gstPct}% GST</small>
              </div>
            </div>

            {/* Full Commercial Quotation Breakdown Table */}
            <div className="breakdown-table-wrapper">
              <table className="breakdown-table">
                <tbody>
                  <tr className="total-monthly-row">
                    <td>
                      <EditableText
                        text="Monthly price (server only, excl. GST)"
                        textKey="monthly"
                        textOverrides={inp.textOverrides}
                        onSetTextOverride={setTextOverride}
                        onClearTextOverride={clearTextOverride}
                      />
                    </td>
                    <td>
                      <EditableAmount
                        value={res.monthly}
                        overrideKey="monthly"
                        overrides={inp.overrides}
                        onSetOverride={setOverride}
                        onClearOverride={clearOverride}
                        format={inr}
                      />
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <EditableText
                        text="Yearly without discount"
                        textKey="yearGross"
                        textOverrides={inp.textOverrides}
                        onSetTextOverride={setTextOverride}
                        onClearTextOverride={clearTextOverride}
                      />
                    </td>
                    <td>
                      <EditableAmount
                        value={res.yearGross}
                        overrideKey="yearGross"
                        overrides={inp.overrides}
                        onSetOverride={setOverride}
                        onClearOverride={clearOverride}
                        format={inr}
                      />
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <EditableText
                        text={`One-time: Markup (${rates.markupPct}%)`}
                        textKey="markup"
                        textOverrides={inp.textOverrides}
                        onSetTextOverride={setTextOverride}
                        onClearTextOverride={clearTextOverride}
                      />
                    </td>
                    <td>
                      <EditableAmount
                        value={res.markup}
                        overrideKey="markup"
                        overrides={inp.overrides}
                        onSetOverride={setOverride}
                        onClearOverride={clearOverride}
                        format={inr}
                      />
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <EditableText
                        text="One-time: User / branch / client / module fees"
                        textKey="fees"
                        textOverrides={inp.textOverrides}
                        onSetTextOverride={setTextOverride}
                        onClearTextOverride={clearTextOverride}
                      />
                    </td>
                    <td>
                      <EditableAmount
                        value={res.fees}
                        overrideKey="fees"
                        overrides={inp.overrides}
                        onSetOverride={setOverride}
                        onClearOverride={clearOverride}
                        format={inr}
                      />
                    </td>
                  </tr>

                  <tr className="setup-fee-row">
                    <td>
                      <EditableText
                        text="One-time setup"
                        textKey="setupFee"
                        textOverrides={inp.textOverrides}
                        onSetTextOverride={setTextOverride}
                        onClearTextOverride={clearTextOverride}
                      />{' '}
                      <span className="badge-setup-tag">Setup</span>
                    </td>
                    <td>
                      <EditableAmount
                        value={res.setupFee ?? rates.setupFee}
                        overrideKey="setupFee"
                        overrides={inp.overrides}
                        onSetOverride={setOverride}
                        onClearOverride={clearOverride}
                        format={inr}
                      />
                    </td>
                  </tr>

                  <tr className="total-monthly-row">
                    <td>
                      <EditableText
                        text="Total one-time payment (excl. GST)"
                        textKey="oneTimeBase"
                        textOverrides={inp.textOverrides}
                        onSetTextOverride={setTextOverride}
                        onClearTextOverride={clearTextOverride}
                      />
                    </td>
                    <td>
                      <EditableAmount
                        value={res.oneTimeBase}
                        overrideKey="oneTimeBase"
                        overrides={inp.overrides}
                        onSetOverride={setOverride}
                        onClearOverride={clearOverride}
                        format={inr}
                      />
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <EditableText
                        text={`GST (${rates.gstPct}%) on monthly`}
                        textKey="gstMonthly"
                        textOverrides={inp.textOverrides}
                        onSetTextOverride={setTextOverride}
                        onClearTextOverride={clearTextOverride}
                      />
                    </td>
                    <td>
                      <EditableAmount
                        value={res.gst.monthly}
                        overrideKey="gstMonthly"
                        overrides={inp.overrides}
                        onSetOverride={setOverride}
                        onClearOverride={clearOverride}
                        format={inr}
                      />
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <EditableText
                        text={`GST (${rates.gstPct}%) on one-time`}
                        textKey="gstOneTime"
                        textOverrides={inp.textOverrides}
                        onSetTextOverride={setTextOverride}
                        onClearTextOverride={clearTextOverride}
                      />
                    </td>
                    <td>
                      <EditableAmount
                        value={res.gst.oneTime}
                        overrideKey="gstOneTime"
                        overrides={inp.overrides}
                        onSetOverride={setOverride}
                        onClearOverride={clearOverride}
                        format={inr}
                      />
                    </td>
                  </tr>

                  <tr className="total-monthly-row final-payment-row">
                    <td>
                      <EditableText
                        text="Monthly payable (incl. GST)"
                        textKey="monthlyTotal"
                        textOverrides={inp.textOverrides}
                        onSetTextOverride={setTextOverride}
                        onClearTextOverride={clearTextOverride}
                      />
                    </td>
                    <td>
                      <EditableAmount
                        value={res.monthlyTotal}
                        overrideKey="monthlyTotal"
                        overrides={inp.overrides}
                        onSetOverride={setOverride}
                        onClearOverride={clearOverride}
                        format={inr}
                      />
                    </td>
                  </tr>

                  <tr className="total-monthly-row final-payment-row">
                    <td>
                      <EditableText
                        text="One-time payable (incl. GST)"
                        textKey="oneTimeTotal"
                        textOverrides={inp.textOverrides}
                        onSetTextOverride={setTextOverride}
                        onClearTextOverride={clearTextOverride}
                      />
                    </td>
                    <td>
                      <EditableAmount
                        value={res.oneTimeTotal}
                        overrideKey="oneTimeTotal"
                        overrides={inp.overrides}
                        onSetOverride={setOverride}
                        onClearOverride={clearOverride}
                        format={inr}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
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
                <span>Print / Export PDF</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
