import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_RATES, calculate } from '../models/pricing.model.js';
import {
  fetchQuotesApi,
  saveQuoteApi,
  deleteQuoteApi,
  fetchRatesApi,
} from '../models/api.model.js';

const START = {
  client: '',
  contactNo: '',
  mode: 'separate',
  users: 10,
  branches: 2,
  clients: 500,
  backup: true,
  backupFreq: 'daily',
  tracking: true,
  trackedUsers: 10,
  mfi: true,
  hr: false,
  mobileApp: false,
  jewelLoan: false,
  overrides: {},
  textOverrides: {},
};

const loadRates = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('sp_rates')) || {};
    if (!saved.usdToInr || saved.usdToInr === 85) {
      saved.usdToInr = 93;
    }
    const plans =
      saved.plans && saved.plans.length >= DEFAULT_RATES.plans.length
        ? saved.plans
        : DEFAULT_RATES.plans;
    const dbPlans =
      saved.dbPlans && saved.dbPlans.length >= DEFAULT_RATES.dbPlans.length
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

const ALL_MODULES = [
  {
    key: 'backup',
    label: 'Automated Server Backup',
    hint: 'Database snapshots, archive retention & recovery',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
    ),
  },
  {
    key: 'tracking',
    label: 'Live tracking (adds map charge)',
    hint: 'Location tracking and route history',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    ),
  },
  {
    key: 'mfi',
    label: 'MFI module',
    hint: 'Loan cycles, collections & center meetings',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    key: 'hr',
    label: 'HR',
    hint: 'Staff records, payroll & attendance',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <polyline points="17 11 19 13 23 9" />
      </svg>
    ),
  },
  {
    key: 'mobileApp',
    label: 'Mobile app',
    hint: 'Field collections & customer mobile app',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    key: 'jewelLoan',
    label: 'Jewel loan',
    hint: 'Gold appraisal, interest cycles & pledge custody',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 12L2 9z" />
        <path d="M2 9h20" />
        <path d="M10 3l-2 6 4 12 4-12-2-6" />
      </svg>
    ),
  },
];

const BACKUP_FREQ_LABEL = {
  daily: 'Daily',
  weekly: 'Weekly retention',
  monthly: 'Monthly snapshot',
  yearly: 'Yearly (1 mo discount)',
};

const getInitialBilling = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('sp_cust_settings'));
    return saved?.billingCycle || 'monthly';
  } catch {
    return 'monthly';
  }
};

export default function CustomerPageView() {
  const [inp, setInp] = useState(loadInputs);
  const [rates, setRates] = useState(loadRates);
  const [quotes, setQuotes] = useState(loadQuotes);
  const [search, setSearch] = useState('');
  const [activeQuoteId, setActiveQuoteId] = useState(null);
  const [billingCycle, setBillingCycle] = useState(getInitialBilling);

  // Load initial data
  useEffect(() => {
    let mounted = true;
    fetchQuotesApi().then((qs) => {
      if (mounted && qs && qs.length) setQuotes(qs);
    });
    fetchRatesApi().then((r) => {
      if (mounted && r) setRates((prev) => ({ ...prev, ...r }));
    });
    return () => {
      mounted = false;
    };
  }, []);

  const fx = rates.usdToInr || 93;
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
      try {
        const savedCust = JSON.parse(localStorage.getItem('sp_cust_settings'));
        if (savedCust?.billingCycle) {
          setBillingCycle(savedCust.billingCycle);
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('focus', syncFromStorage);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('focus', syncFromStorage);
    };
  }, []);

  const set = (k) => (e) => {
    const t = e.target;
    let val;
    if (t.type === 'checkbox') {
      val = t.checked;
    } else if (t.type === 'number') {
      val = t.value === '' ? '' : Math.max(0, +t.value);
    } else if (k === 'contactNo') {
      val = t.value.replace(/\D/g, '').slice(0, 10);
    } else {
      val = t.value;
    }
    setActiveQuoteId(null);
    setInp((prev) => {
      const updated = { ...prev, [k]: val };
      if (k === 'users') {
        const wasSynced =
          Number(prev.trackedUsers) === Number(prev.users) ||
          prev.trackedUsers === undefined ||
          prev.trackedUsers === '' ||
          !prev.trackedUsersManual;
        if (wasSynced) {
          updated.trackedUsers = val;
        }
      }
      if (k === 'trackedUsers') {
        updated.trackedUsersManual = val !== '' && Number(val) !== Number(prev.users);
      }
      if (k === 'tracking' && val === true && (!prev.trackedUsers || prev.trackedUsers === 0)) {
        updated.trackedUsers = prev.users || 10;
      }
      return updated;
    });
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
  };

  const delQuote = async (id) => {
    setQuotes(quotes.filter((q) => q.id !== id));
    if (activeQuoteId === id) setActiveQuoteId(null);
    await deleteQuoteApi(id);
  };

  const saveQuote = async () => {
    if (!inp.client || !inp.client.trim()) {
      alert('Please enter a Client Name first to save this quotation.');
      return;
    }
    const q = {
      id: (() => {
        const nums = quotes
          .map((q) => parseInt(String(q.id).replace(/^Q/i, ''), 10))
          .filter((n) => !isNaN(n));
        const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
        return String(next).padStart(3, '0');
      })(),
      client: inp.client.trim(),
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
    await saveQuoteApi(q);
    alert(`Quotation for "${inp.client.trim()}" saved successfully.`);
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

  // Only modules enabled in the current quote
  const activeModules = ALL_MODULES.filter((m) => !!inp[m.key]);

  return (
    <div className="app-wrapper customer-view-page">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-icon-box" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <div className="header-text">
          <h1>Customer Quotation</h1>
          <p>Client-facing presentation quote with verified scope and included add-on modules</p>
        </div>
      </header>

      {/* Main 2-Column Responsive Layout */}
      <div className="main-grid calculator-main-grid customer-main-grid">
        {/* Left Column: Client Parameters & Saved Quotes */}
        <div className="calculator-col calculator-left-col">
          <section className="card input">
            <div className="section-title">
              <span>Client &amp; Service Scope</span>
            </div>

            {/* Company Name & Contact No */}
            <div className="client-fields-row">
              <div className="field-group" style={{ flex: 1, minWidth: 0 }}>
                <label className="field-label" htmlFor="cust-client-name">
                  Company Name <span className="req">*</span>
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
              <div className="field-group" style={{ flex: 1, minWidth: 0 }}>
                <label className="field-label" htmlFor="cust-contact-no">
                  Contact No
                </label>
                <input
                  id="cust-contact-no"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  className="input-box client-name-input"
                  placeholder="e.g. 9876543210"
                  value={inp.contactNo || ''}
                  onChange={set('contactNo')}
                />
              </div>
            </div>

            {/* Scale Requirements */}
            <div className="field-group">
              <div className="section-title" style={{ marginTop: '4px' }}>
                <span>Scale Requirements</span>
              </div>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span className="metric-label">Staff</span>
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
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    <span className="metric-label">Branch</span>
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
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="metric-label">Customer</span>
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

            {/* Add-on Modules */}
            <div className="field-group modules-field-group">
              <div className="section-title" style={{ marginTop: '8px' }}>
                <span>Add-on Modules</span>
              </div>
              <div className="modules-container modules-grid-wrap">
                <label className={`module-toggle-card ${inp.mfi ? 'active' : ''}`}>
                  <div className="module-info">
                    <div className="module-icon-wrap">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <div>
                      <span className="module-title">MFI module</span>
                      <span className="module-hint">Loan cycles, collections &amp; center meetings</span>
                    </div>
                  </div>
                  <span className="switch">
                    <input type="checkbox" checked={!!inp.mfi} onChange={set('mfi')} />
                    <span className="slider"></span>
                  </span>
                </label>

                <label className={`module-toggle-card ${inp.tracking ? 'active' : ''}`}>
                  <div className="module-info">
                    <div className="module-info">
                      <div className="module-icon-wrap">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="3 11 22 2 13 21 11 13 3 11" />
                        </svg>
                      </div>
                      <div>
                        <span className="module-title">Live tracking (adds map charge)</span>
                        <span className="module-hint">Location tracking and route history</span>
                      </div>
                    </div>
                  </div>
                  <span className="switch">
                    <input type="checkbox" checked={!!inp.tracking} onChange={set('tracking')} />
                    <span className="slider"></span>
                  </span>
                </label>

                <label className={`module-toggle-card ${inp.hr ? 'active' : ''}`}>
                  <div className="module-info">
                    <div className="module-icon-wrap">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <polyline points="17 11 19 13 23 9" />
                      </svg>
                    </div>
                    <div>
                      <span className="module-title">HR</span>
                      <span className="module-hint">Staff records, payroll &amp; attendance</span>
                    </div>
                  </div>
                  <span className="switch">
                    <input type="checkbox" checked={!!inp.hr} onChange={set('hr')} />
                    <span className="slider"></span>
                  </span>
                </label>

                <label className={`module-toggle-card ${inp.mobileApp ? 'active' : ''}`}>
                  <div className="module-info">
                    <div className="module-icon-wrap">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                      </svg>
                    </div>
                    <div>
                      <span className="module-title">Mobile app</span>
                      <span className="module-hint">Field collections &amp; customer mobile app</span>
                    </div>
                  </div>
                  <span className="switch">
                    <input type="checkbox" checked={!!inp.mobileApp} onChange={set('mobileApp')} />
                    <span className="slider"></span>
                  </span>
                </label>

                <label className={`module-toggle-card ${inp.jewelLoan ? 'active' : ''}`}>
                  <div className="module-info">
                    <div className="module-icon-wrap">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 3h12l4 6-10 12L2 9z" />
                        <path d="M2 9h20" />
                        <path d="M10 3l-2 6 4 12 4-12-2-6" />
                      </svg>
                    </div>
                    <div>
                      <span className="module-title">Jewel loan</span>
                      <span className="module-hint">Gold appraisal, interest cycles &amp; pledge custody</span>
                    </div>
                  </div>
                  <span className="switch">
                    <input type="checkbox" checked={!!inp.jewelLoan} onChange={set('jewelLoan')} />
                    <span className="slider"></span>
                  </span>
                </label>
              </div>

              {inp.tracking && (
                <div className="sub-input-wrap">
                  <label className="field-label" htmlFor="cust-tracked-users">
                    Staff tracked live
                  </label>
                  <input
                    id="cust-tracked-users"
                    type="number"
                    min="0"
                    className="input-box"
                    placeholder={String(inp.users ?? 10)}
                    value={inp.trackedUsers !== undefined ? inp.trackedUsers : inp.users}
                    onChange={set('trackedUsers')}
                  />
                </div>
              )}
            </div>

            {/* Backup */}
            <div className="field-group backup-field-group">
              <div className="section-title">
                <span>Backup</span>
              </div>
              <div className="backup-section-card">
                <label className={`module-toggle-card backup-toggle-card ${inp.backup ? 'active' : ''}`}>
                  <div className="module-info">
                    <div className="module-icon-wrap">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                    </div>
                    <div>
                      <span className="module-title">Automated Server Backup</span>
                      <span className="module-hint">Database snapshots, archive retention &amp; recovery</span>
                    </div>
                  </div>
                  <span className="switch">
                    <input type="checkbox" checked={inp.backup} onChange={set('backup')} />
                    <span className="slider"></span>
                  </span>
                </label>

                {inp.backup && (
                  <div className="backup-freq-container">
                    <div className="backup-freq-header-label">Backup Schedule / Retention:</div>
                    <div className="backup-freq-grid">
                      {[
                        { id: 'daily', label: 'Daily', hint: 'Every 24h' },
                        { id: 'weekly', label: 'Weekly', hint: 'Weekly retention' },
                        { id: 'monthly', label: 'Monthly', hint: 'Monthly snapshot' },
                        { id: 'yearly', label: 'Yearly', hint: 'only 1 month discount', badge: '1 mo discount' },
                      ].map((item) => {
                        const isSel = (inp.backupFreq || 'daily') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`backup-freq-btn ${isSel ? 'active' : ''}`}
                            onClick={() => setInp({ ...inp, backupFreq: item.id })}
                          >
                            <div className="backup-freq-title-row">
                              <span className="backup-freq-name">{item.label}</span>
                              {item.badge && <span className="backup-freq-badge">{item.badge}</span>}
                            </div>
                            <span className="backup-freq-sub">{item.hint}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Saved Quotes Section */}
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
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
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
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
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
                                {q.inp?.users ?? 0} Staff · {q.inp?.branches ?? 0} Branch · {q.inp?.clients ?? 0} Customer{q.inp?.contactNo ? ` · Ph: ${q.inp.contactNo}` : ''}
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

        {/* Right Column: Customer Quotation Card (Read-Only + Included Add-on Modules) */}
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
                <div className="quote-print-date">
                  Date: {quoteDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Company & Scope Metadata Card */}
            <div className="quote-company-spec-card">
              <div className="quote-spec-item">
                <span className="quote-spec-k">Company Name</span>
                <span className="quote-spec-v">{inp.client && inp.client.trim() ? inp.client.trim() : '—'}</span>
              </div>
              <div className="quote-spec-item">
                <span className="quote-spec-k">Contact No</span>
                <span className="quote-spec-v">{inp.contactNo && inp.contactNo.trim() ? inp.contactNo.trim() : '—'}</span>
              </div>
              <div className="quote-spec-item">
                <span className="quote-spec-k">Branch</span>
                <span className="quote-spec-v">{inp.branches || 0}</span>
              </div>
              <div className="quote-spec-item">
                <span className="quote-spec-k">Staff</span>
                <span className="quote-spec-v">{inp.users || 0}</span>
              </div>
              <div className="quote-spec-item">
                <span className="quote-spec-k">Customer</span>
                <span className="quote-spec-v">{inp.clients || 0}</span>
              </div>
            </div>

            {/* Prominent Dual Pricing Cards (Click to switch Monthly / Yearly view) */}
            <div className="pricing-dual-grid" style={{ marginTop: '14px' }}>
              <div
                className={`price-box price-box-monthly clickable ${billingCycle === 'monthly' ? 'selected-cycle' : ''}`}
                onClick={() => setBillingCycle('monthly')}
                style={{ cursor: 'pointer' }}
                title="Click to show Monthly payable"
              >
                <div className="price-box-header">
                  <span className="price-box-title">Monthly</span>
                  {billingCycle === 'monthly' && <span className="cycle-selected-badge">✓ Active</span>}
                </div>
                <div className="price-box-val">{inr(res.monthlyTotal)}</div>
                <small>incl. {rates.gstPct}% GST</small>
              </div>

              <div
                className={`price-box price-box-yearly clickable ${billingCycle === 'yearly' ? 'selected-cycle' : ''}`}
                onClick={() => setBillingCycle('yearly')}
                style={{ cursor: 'pointer' }}
                title="Click to show Yearly payable & 1 month discount"
              >
                <div className="price-box-header">
                  <span className="price-box-title">Yearly</span>
                  <span className="price-discount-tag">-1 mo discount</span>
                  {billingCycle === 'yearly' && <span className="cycle-selected-badge">✓ Active</span>}
                </div>
                <div className="price-box-val">{inr(res.yearlyTotal)}</div>
                <small>incl. {rates.gstPct}% GST</small>
              </div>
            </div>

            {/* Clickable Toggle to switch Monthly or Yearly view */}
            <div className="billing-cycle-toggle-bar">
              <span className="toggle-label">Payable View:</span>
              <div className="toggle-btn-group">
                <button
                  type="button"
                  className={`cycle-toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly Payable
                </button>
                <button
                  type="button"
                  className={`cycle-toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('yearly')}
                >
                  Yearly Payable
                </button>
              </div>
            </div>

            {/* Commercial Quotation Summary Table */}
            <div className="breakdown-table-wrapper">
              <table className="breakdown-table">
                <tbody>
                  {/* Add on module row placed directly above MFI module */}
                  <tr>
                    <td>Add on module</td>
                    <td></td>
                  </tr>

                  {/* MFI module row if active */}
                  {inp.mfi && (
                    <tr>
                      <td>MFI module</td>
                      <td></td>
                    </tr>
                  )}

                  {/* Other active modules (excluding backup and mfi) */}
                  {activeModules
                    .filter((mod) => mod.key !== 'backup' && mod.key !== 'mfi')
                    .map((mod) => {
                      let extra = '';
                      if (mod.key === 'tracking' && inp.trackedUsers) {
                        extra = ` (${inp.trackedUsers} staff tracked)`;
                      }
                      return (
                        <tr key={mod.key}>
                          <td>{`${mod.label}${extra}`}</td>
                          <td></td>
                        </tr>
                      );
                    })}

                  {/* Monthly Payable: shown when Monthly is clicked */}
                  {billingCycle === 'monthly' && (
                    <tr className="total-monthly-row final-payment-row">
                      <td>Monthly payable (incl. GST)</td>
                      <td>{inr(res.monthlyTotal)}</td>
                    </tr>
                  )}

                  {/* Yearly Payable & One month discount: shown when Yearly is clicked */}
                  {billingCycle === 'yearly' && (
                    <>
                      <tr className="total-monthly-row final-payment-row">
                        <td>Yearly payable (incl. GST)</td>
                        <td>{inr(res.monthlyTotal * 12)}</td>
                      </tr>

                      <tr className="total-monthly-row final-payment-row">
                        <td>One month discount</td>
                        <td>{inr(res.monthlyTotal)}</td>
                      </tr>
                    </>
                  )}
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
