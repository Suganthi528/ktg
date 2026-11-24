import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_RATES, calculate } from '../models/pricing.model.js';

const BASE = {
  client: '',
  mode: 'separate',
  users: 10,
  branches: 2,
  clients: 500,
  backup: true,
  tracking: true,
  trackedUsers: 10,
  mfi: true,
};

const readRates = () => {
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

const read = (k, d) => {
  try {
    return { ...d, ...JSON.parse(localStorage.getItem(k)) };
  } catch {
    return d;
  }
};

const STEPS = {
  users: [5, 10, 20, 50, 100, 200, 500, 1000, 2500, 5000, 10000],
  branches: [1, 2, 5, 10, 20, 50, 100, 200],
  clients: [100, 500, 1000, 5000, 10000, 25000, 50000, 100000],
  trackedUsers: [0, 5, 10, 25, 50, 100, 200, 500, 1000],
};

const LABEL = {
  users: 'Users',
  branches: 'Branches',
  clients: 'Clients',
  trackedUsers: 'Live-tracked users',
};

const PRESETS = [
  { label: 'Starter', users: 10, branches: 2, clients: 500, tracked: 5 },
  { label: 'Growth', users: 50, branches: 10, clients: 5000, tracked: 25 },
  { label: 'Enterprise', users: 200, branches: 40, clients: 25000, tracked: 100 },
];

const SECTIONS = [
  { id: 'all', label: 'All Sections' },
  { id: 'hardware', label: 'Server & Database' },
  { id: 'upgrades', label: 'Upgrade Limits' },
  { id: 'storage', label: 'Storage & Map' },
  { id: 'pricing', label: 'Cost Breakdown' },
  { id: 'projections', label: 'Scale Simulation' },
];

export default function Capacity() {
  const rates = useMemo(readRates, []);
  const [inp, setInp] = useState(() => read('sp_inp', BASE));
  const [driver, setDriver] = useState('clients');
  const [activeTab, setActiveTab] = useState('all');

  const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const fmt = (n) => Math.round(n).toLocaleString('en-IN');
  const d = (n) => '$' + (+n.toFixed(2));

  // Sync inputs with localStorage so Calculator and Capacity stay aligned
  useEffect(() => {
    try {
      localStorage.setItem('sp_inp', JSON.stringify(inp));
    } catch {
      /* ignore */
    }
  }, [inp]);

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

  const applyPreset = (p) => {
    setInp((prev) => ({
      ...prev,
      users: p.users,
      branches: p.branches,
      clients: p.clients,
      trackedUsers: p.tracked,
    }));
  };

  const calc = (o) => calculate({ ...o, mode: 'separate' }, rates);
  const res = calc(inp);
  const tracked = inp.tracking ? Math.min(inp.trackedUsers, inp.users) : 0;
  const dbLoad = res.dbLoad;

  // Smallest count at which plan steps up
  const upgradeAt = (key, which) => {
    const name = (o) => (which === 'server' ? calc(o).plan.name : calc(o).dbPlan.name);
    const cur = name(inp);
    let hi = Math.max(10, inp[key] * 2);
    while (name({ ...inp, [key]: hi }) === cur && hi < 1e7) hi *= 2;
    if (name({ ...inp, [key]: hi }) === cur) return null;
    let lo = inp[key];
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      if (name({ ...inp, [key]: mid }) === cur) lo = mid;
      else hi = mid;
    }
    return hi;
  };

  const isTop = (plans, p) => plans[plans.length - 1].name === p.name;

  const fees = {
    users: inp.users * rates.perUser,
    branches: inp.branches * rates.perBranch,
    clients: inp.clients * rates.perClient,
    backup: inp.backup ? rates.moduleFee.backup : 0,
    tracking: inp.tracking ? rates.moduleFee.tracking : 0,
    mfi: inp.mfi ? rates.moduleFee.mfi : 0,
    hr: inp.hr ? rates.moduleFee.hr ?? 2000 : 0,
    mobileApp: inp.mobileApp ? rates.moduleFee.mobileApp ?? 2500 : 0,
    jewelLoan: inp.jewelLoan ? rates.moduleFee.jewelLoan ?? 2000 : 0,
  };

  const fx = rates.usdToInr;
  const g = rates.gstPct ?? 18;
  const extraGB = Math.max(0, res.storageGB - 250);

  const formula = {
    linode: `${d(res.planUsd)} × ₹${fx}`,
    linodeBackup: inp.backup ? `${d(res.planUsd)} × ${rates.linodeBackupPct}% × ₹${fx}` : 'Backup off → 0',
    db: `${d(res.dbUsd)} × ₹${fx}`,
    storage: `(${d(rates.spacesUsdPer250GB)} + ${extraGB.toFixed(1)} GB extra × ${d(rates.spacesExtraUsdPerGB)}) × ₹${fx}`,
    map: `${d(res.mapUsd)} (all calls billed, no free tier) × ₹${fx}`,
  };

  const rows = STEPS[driver].map((v) => {
    const o = { ...inp, [driver]: v };
    if (driver === 'trackedUsers') o.tracking = v > 0;
    return { v, res: calc(o) };
  });

  const serverLoadPct = Math.round((res.load / res.plan.cap) * 100);
  const dbLoadPct = Math.round((dbLoad / res.dbPlan.cap) * 100);

  const getLoadBadgeClass = (pct) => {
    if (pct > 85) return 'cap-status-danger';
    if (pct > 65) return 'cap-status-warning';
    return 'cap-status-success';
  };

  return (
    <div className="app-wrapper cap-page-wrapper">
      {/* Header */}
      <header className="app-header cap-header">
        <div className="header-icon-box cap-header-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
            <line x1="6" y1="6" x2="6.01" y2="6"></line>
            <line x1="6" y1="18" x2="6.01" y2="18"></line>
          </svg>
        </div>
        <div className="header-text">
          <div className="cap-header-row">
            <h1>Capacity Planning &amp; Sizing</h1>
            <span className="cap-sync-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              Synced with Calculator
            </span>
          </div>
          <p>Configure client scale on the left and see server headroom, database limits, storage volume, and detailed pricing in real time.</p>
        </div>
      </header>

      {/* Main 2-Column Responsive Layout */}
      <div className="cap-layout-grid">
        {/* Left: Sticky Client Configuration Sidebar */}
        <aside className="cap-sidebar">
          <section className="card cap-sidebar-card">
            <div className="section-title">
              <span>Client Configuration</span>
              <span className="cap-config-badge">{inp.client || 'Draft Quote'}</span>
            </div>

            {/* Quick Scale Presets */}
            <div className="cap-presets-block">
              <span className="cap-micro-label">Quick Presets</span>
              <div className="cap-presets-grid">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className="cap-preset-btn"
                    onClick={() => applyPreset(p)}
                    title={`${p.users} users, ${p.branches} branches, ${p.clients} clients`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Client Name Input */}
            <div className="field-group">
              <label className="field-label" htmlFor="cap-client-name">
                Client name
              </label>
              <input
                id="cap-client-name"
                className="input-box"
                value={inp.client}
                onChange={set('client')}
                placeholder="e.g. ABC Finance"
              />
            </div>

            {/* Scale & Capacity Metrics */}
            <div className="field-group">
              <label className="field-label">Scale &amp; Capacity</label>
              <div className="cap-metrics-stack">
                {/* Users */}
                <div className="cap-metric-card">
                  <div className="cap-metric-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>Users</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    className="metric-input cap-direct-input"
                    value={inp.users}
                    onChange={set('users')}
                    placeholder="0"
                  />
                </div>

                {/* Branches */}
                <div className="cap-metric-card">
                  <div className="cap-metric-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    <span>Branches</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    className="metric-input cap-direct-input"
                    value={inp.branches}
                    onChange={set('branches')}
                    placeholder="0"
                  />
                </div>

                {/* Clients */}
                <div className="cap-metric-card">
                  <div className="cap-metric-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Clients</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    className="metric-input cap-direct-input"
                    value={inp.clients}
                    onChange={set('clients')}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Modules Section */}
            <div className="field-group">
              <div className="section-title" style={{ marginTop: '10px' }}>
                <span>Modules</span>
              </div>
              <div className="modules-container">
                {/* Backup */}
                <label className={`module-toggle-card ${inp.backup ? 'active' : ''}`}>
                  <div className="module-info">
                    <div className="module-icon-wrap">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                    </div>
                    <div>
                      <span className="module-title">Backup</span>
                      <span className="module-hint">Automated snapshots & 3x retention</span>
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
                        <polygon points="3 11 22 2 13 21 11 13 3 11" />
                      </svg>
                    </div>
                    <div>
                      <span className="module-title">Live tracking</span>
                      <span className="module-hint">GPS route tracking & maps</span>
                    </div>
                  </div>
                  <span className="switch">
                    <input type="checkbox" checked={inp.tracking} onChange={set('tracking')} />
                    <span className="slider"></span>
                  </span>
                </label>

                {inp.tracking && (
                  <div className="sub-input-wrap">
                    <label className="field-label" htmlFor="cap-tracked-users">
                      Tracked users
                    </label>
                    <input
                      id="cap-tracked-users"
                      type="number"
                      min="0"
                      className="input-box"
                      value={inp.trackedUsers}
                      onChange={set('trackedUsers')}
                    />
                  </div>
                )}

                {/* MFI Module */}
                <label className={`module-toggle-card ${inp.mfi ? 'active' : ''}`}>
                  <div className="module-info">
                    <div className="module-icon-wrap">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <div>
                      <span className="module-title">MFI</span>
                      <span className="module-hint">Loan centers & collection cycles</span>
                    </div>
                  </div>
                  <span className="switch">
                    <input type="checkbox" checked={inp.mfi} onChange={set('mfi')} />
                    <span className="slider"></span>
                  </span>
                </label>

                {/* HR Module */}
                <label className={`module-toggle-card ${inp.hr ? 'active' : ''}`}>
                  <div className="module-info">
                    <div className="module-icon-wrap">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" />
                      </svg>
                    </div>
                    <div>
                      <span className="module-title">HR</span>
                      <span className="module-hint">Staff records, payroll & attendance</span>
                    </div>
                  </div>
                  <span className="switch">
                    <input type="checkbox" checked={!!inp.hr} onChange={set('hr')} />
                    <span className="slider"></span>
                  </span>
                </label>

                {/* Mobile app Module */}
                <label className={`module-toggle-card ${inp.mobileApp ? 'active' : ''}`}>
                  <div className="module-info">
                    <div className="module-icon-wrap">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
                      </svg>
                    </div>
                    <div>
                      <span className="module-title">Mobile app</span>
                      <span className="module-hint">Field collections & customer app</span>
                    </div>
                  </div>
                  <span className="switch">
                    <input type="checkbox" checked={!!inp.mobileApp} onChange={set('mobileApp')} />
                    <span className="slider"></span>
                  </span>
                </label>

                {/* Jewel loan Module */}
                <label className={`module-toggle-card ${inp.jewelLoan ? 'active' : ''}`}>
                  <div className="module-info">
                    <div className="module-icon-wrap">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 3h12l4 6-10 12L2 9z" /><path d="M2 9h20" />
                      </svg>
                    </div>
                    <div>
                      <span className="module-title">Jewel loan</span>
                      <span className="module-hint">Gold appraisal & pledge custody</span>
                    </div>
                  </div>
                  <span className="switch">
                    <input type="checkbox" checked={!!inp.jewelLoan} onChange={set('jewelLoan')} />
                    <span className="slider"></span>
                  </span>
                </label>
              </div>
            </div>

            <div className="cap-sync-footer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>These values are shared with the Calculator page.</span>
            </div>
          </section>
        </aside>

        {/* Right: Main Dashboard Area */}
        <main className="cap-main">
          {/* Executive Overview KPI Ribbon */}
          <section className="cap-hero-ribbon">
            {/* Server Card */}
            <div className="cap-kpi-card">
              <div className="cap-kpi-top">
                <span className="cap-kpi-label">Web / App Server</span>
                <span className={`cap-status-pill ${getLoadBadgeClass(serverLoadPct)}`}>
                  {serverLoadPct}% capacity
                </span>
              </div>
              <div className="cap-kpi-val">{res.plan.name}</div>
              <div className="cap-kpi-sub">
                <b>{d(res.planUsd)}/mo</b> · {inr(res.planUsd * fx)}/mo
              </div>
            </div>

            {/* Database Card */}
            <div className="cap-kpi-card">
              <div className="cap-kpi-top">
                <span className="cap-kpi-label">Managed Database</span>
                <span className={`cap-status-pill ${getLoadBadgeClass(dbLoadPct)}`}>
                  {dbLoadPct}% capacity
                </span>
              </div>
              <div className="cap-kpi-val">{res.dbPlan.name}</div>
              <div className="cap-kpi-sub">
                <b>{d(res.dbUsd)}/mo</b> · {inr(res.dbUsd * fx)}/mo
              </div>
            </div>

            {/* Monthly Payable */}
            <div className="cap-kpi-card cap-kpi-highlight">
              <div className="cap-kpi-top">
                <span className="cap-kpi-label">Monthly Payable</span>
                <span className="cap-status-pill cap-status-blue">Incl. GST</span>
              </div>
              <div className="cap-kpi-val cap-val-blue">{inr(res.monthlyTotal)}</div>
              <div className="cap-kpi-sub">
                Base: {inr(res.monthly)} + GST {inr(res.gst.monthly)}
              </div>
            </div>

            {/* One-Time Payable */}
            <div className="cap-kpi-card">
              <div className="cap-kpi-top">
                <span className="cap-kpi-label">One-Time Payable</span>
                <span className="cap-status-pill cap-status-green">Margin {inr(res.profit)}</span>
              </div>
              <div className="cap-kpi-val">{inr(res.oneTimeTotal)}</div>
              <div className="cap-kpi-sub">
                Excl. GST: {inr(res.oneTimeBase)}
              </div>
            </div>
          </section>

          {/* Quick Filter Navigation Bar */}
          <nav className="cap-view-bar" aria-label="Section navigation">
            <span className="cap-view-bar-title">View:</span>
            <div className="cap-view-pills">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  className={`cap-view-pill ${activeTab === sec.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(sec.id)}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </nav>

          {/* SECTION 1: Hardware Specs & Compute (Linode + DigitalOcean) */}
          {(activeTab === 'all' || activeTab === 'hardware') && (
            <div className="cap-grid-hardware">
              {/* Server (Linode) Card */}
              <section className="card cap-card">
                <div className="cap-card-header">
                  <div className="cap-card-title-wrap">
                    <div className="cap-card-icon cap-icon-linode">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                        <line x1="6" y1="6" x2="6.01" y2="6" />
                        <line x1="6" y1="18" x2="6.01" y2="18" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="cap-card-title">Server (Linode)</h3>
                      <p className="cap-card-sub">
                        <b>{res.plan.name}</b> (list {d(res.plan.usd)}) — priced at {d(res.planUsd)} × ₹{fx} = {inr(res.planUsd * fx)}/month for this load. Plan picked because it is the smallest with capacity ≥ load.
                      </p>
                    </div>
                  </div>
                  <span className={`cap-status-pill ${getLoadBadgeClass(serverLoadPct)}`}>
                    {serverLoadPct}% Load
                  </span>
                </div>

                {/* Progress Bar & Meter */}
                <div className="cap-meter-wrap">
                  <div className="cap-meter-track">
                    <div
                      className={`cap-meter-fill ${serverLoadPct > 85 ? 'hot' : serverLoadPct > 65 ? 'warn' : ''}`}
                      style={{ width: `${Math.min(100, serverLoadPct)}%` }}
                    />
                  </div>
                  <div className="cap-meter-labels">
                    <span>Current load: <b>{res.load.toFixed(1)}</b></span>
                    <span>Plan limit: <b>{res.plan.cap} points</b></span>
                  </div>
                </div>

                {/* Formula Breakdown */}
                <div className="cap-formula-card">
                  <span className="cap-formula-title">Load Breakdown Formula:</span>
                  <div className="cap-formula-chips">
                    {Object.entries(res.moduleCalls).filter(([, v]) => v > 0).map(([k, v], i) => (
                      <span key={k} style={{ display: 'contents' }}>
                        {i > 0 && <span className="cap-chip-op">+</span>}
                        <span className="cap-chip">{k}: {Math.round(v).toLocaleString('en-IN')}</span>
                      </span>
                    ))}
                    <span className="cap-chip-op">=</span>
                    <span className="cap-chip-total">{Math.round(res.dailyCalls).toLocaleString('en-IN')} calls/day</span>
                  </div>
                  <code>peak = {Math.round(res.dailyCalls).toLocaleString('en-IN')} × {rates.peakShare} = {Math.round(res.peakPerMin).toLocaleString('en-IN')} calls/min ({(res.peakPerMin / 60).toFixed(0)}/sec) ÷ {rates.callsPerLoadPoint} = {res.load.toFixed(1)} points</code>
                </div>

                {/* Headroom / Over-limit banner */}
                <div className={`cap-headroom-banner ${isTop(rates.plans, res.plan) && res.load > res.plan.cap ? 'danger' : ''}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>
                    Headroom: <b>{Math.max(0, res.plan.cap - res.load).toFixed(0)} load points</b>
                    {isTop(rates.plans, res.plan) && res.load > res.plan.cap
                      ? ' — over the biggest plan, needs more than one server'
                      : ' remaining before needing next tier.'}
                  </span>
                </div>
              </section>

              {/* Database (DigitalOcean) Card */}
              <section className="card cap-card">
                <div className="cap-card-header">
                  <div className="cap-card-title-wrap">
                    <div className="cap-card-icon cap-icon-db">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="cap-card-title">Database (DigitalOcean)</h3>
                      <p className="cap-card-sub">
                        <b>{res.dbPlan.name}</b> (list {d(res.dbPlan.usd)}) — priced at {d(res.dbUsd)} × ₹{fx} = {inr(res.dbUsd * fx)}/month for this load. Plan picked because it is the smallest DB plan with capacity ≥ load.
                      </p>
                    </div>
                  </div>
                  <span className={`cap-status-pill ${getLoadBadgeClass(dbLoadPct)}`}>
                    {dbLoadPct}% Load
                  </span>
                </div>

                {/* Progress Bar & Meter */}
                <div className="cap-meter-wrap">
                  <div className="cap-meter-track">
                    <div
                      className={`cap-meter-fill ${dbLoadPct > 85 ? 'hot' : dbLoadPct > 65 ? 'warn' : ''}`}
                      style={{ width: `${Math.min(100, dbLoadPct)}%` }}
                    />
                  </div>
                  <div className="cap-meter-labels">
                    <span>Database load: <b>{dbLoad.toFixed(1)}</b></span>
                    <span>Plan limit: <b>{res.dbPlan.cap} points</b></span>
                  </div>
                </div>

                {/* Formula Breakdown */}
                <div className="cap-formula-card">
                  <span className="cap-formula-title">DB Load Breakdown Formula:</span>
                  <div className="cap-formula-chips">
                    <span className="cap-chip">({inp.clients} ÷ 50) clients</span>
                    <span className="cap-chip-op">+</span>
                    <span className="cap-chip">({Math.round(res.dailyCalls).toLocaleString('en-IN')} ÷ {rates.dbCallsPerLoadPoint}) API calls/day</span>
                    <span className="cap-chip-op">=</span>
                    <span className="cap-chip-total">{dbLoad.toFixed(1)} points</span>
                  </div>
                  <code>{inp.clients} ÷ 50 + {Math.round(res.dailyCalls)} ÷ {rates.dbCallsPerLoadPoint} = {dbLoad.toFixed(1)}</code>
                </div>

                {/* Headroom banner */}
                <div className="cap-headroom-banner">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>
                    Headroom: <b>{Math.max(0, res.dbPlan.cap - dbLoad).toFixed(0)} DB points</b> remaining before stepping up to next tier.
                  </span>
                </div>
              </section>
            </div>
          )}

          {/* SECTION 2: When will it need an upgrade? */}
          {(activeTab === 'all' || activeTab === 'upgrades') && (
            <section className="card cap-card">
              <div className="cap-card-header">
                <div className="cap-card-title-wrap">
                  <div className="cap-card-icon cap-icon-upgrade">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="cap-card-title">When will it need an upgrade?</h3>
                    <p className="cap-card-sub">Smallest count (others unchanged) at which the plan steps up:</p>
                  </div>
                </div>
              </div>

              <div className="cap-table-wrapper">
                <table className="how-table cap-table cap-matrix-table">
                  <thead>
                    <tr>
                      <th style={{ width: '38%' }}>Tier Step Target</th>
                      <th>Users</th>
                      <th>Branches</th>
                      <th>Clients</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className="cap-table-badge cap-badge-server">Server</span>
                        <b>Next after {res.plan.name}</b>
                      </td>
                      {['users', 'branches', 'clients'].map((k) => {
                        const v = upgradeAt(k, 'server');
                        return (
                          <td key={k}>
                            {v === null ? (
                              <span className="cap-tag-max">max plan</span>
                            ) : (
                              <span className="cap-upgrade-point">
                                <b>{fmt(v)}</b> {LABEL[k].toLowerCase()}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td>
                        <span className="cap-table-badge cap-badge-db">Database</span>
                        <b>Next after {res.dbPlan.name}</b>
                      </td>
                      {['users', 'branches', 'clients'].map((k) => {
                        const v = upgradeAt(k, 'db');
                        return (
                          <td key={k}>
                            {v === null ? (
                              <span className="cap-tag-max">max plan</span>
                            ) : (
                              <span className="cap-upgrade-point">
                                <b>{fmt(v)}</b> {LABEL[k].toLowerCase()}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="cap-note" style={{ marginTop: '10px' }}>
                "max plan" means the count alone can't push it to a bigger plan (for example branches don't affect the database).
              </p>
            </section>
          )}

          {/* SECTION 3: Storage & Map Capacity */}
          {(activeTab === 'all' || activeTab === 'storage') && (
            <section className="card cap-card">
              <div className="cap-card-header">
                <div className="cap-card-title-wrap">
                  <div className="cap-card-icon cap-icon-storage">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="cap-card-title">Storage &amp; Map</h3>
                    <p className="cap-card-sub">Data volume, retention multiplier, and monthly map loads.</p>
                  </div>
                </div>
              </div>

              <div className="cap-table-wrapper">
                <table className="how-table cap-table">
                  <thead>
                    <tr>
                      <th style={{ width: '32%' }}>Item</th>
                      <th>Formula with your counts</th>
                      <th style={{ textAlign: 'right' }}>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><b>Client data (docs / photos)</b></td>
                      <td>
                        {inp.clients} clients × {rates.mbPerClient} MB ÷ 1024 + {tracked} tracked × 0.3 GB
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="cap-val-pill">{res.dataGB.toFixed(2)} GB</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <b>Total stored</b>
                        {inp.backup && <span className="cap-badge-green" style={{ marginLeft: '6px' }}>3x Backups</span>}
                      </td>
                      <td>
                        {inp.backup
                          ? `${res.dataGB.toFixed(2)} GB × 3 backup copies`
                          : `${res.dataGB.toFixed(2)} GB × 1 (no backup)`}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="cap-val-pill cap-val-highlight">{res.storageGB.toFixed(2)} GB</span>
                      </td>
                    </tr>
                    <tr>
                      <td><b>Extra beyond 250 GB</b></td>
                      <td>max(0, {res.storageGB.toFixed(2)} − 250)</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="cap-val-pill">{extraGB.toFixed(2)} GB</span>
                      </td>
                    </tr>
                    <tr>
                      <td><b>Map loads / month</b></td>
                      <td>
                        {tracked} tracked × ({rates.mapJsPerUserPerDay} loads + {rates.mapRoadsPerUserPerDay} roads) per day × {rates.workDaysPerMonth} days
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="cap-val-pill">{fmt(res.mapLoads)} loads</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* SECTION 4: Full Itemized Price Breakdown */}
          {(activeTab === 'all' || activeTab === 'pricing') && (
            <section className="card cap-card">
              <div className="cap-card-header">
                <div className="cap-card-title-wrap">
                  <div className="cap-card-icon cap-icon-price">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="cap-card-title">Price Breakdown Matrix</h3>
                    <p className="cap-card-sub">Infrastructure lines, GST rates, module fees, and margin overview.</p>
                  </div>
                </div>
              </div>

              <div className="cap-scroll">
                <table className="how-table cap-table cap-pricing-matrix">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Item</th>
                      <th>Formula with your counts</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Recurring Infra lines */}
                    {res.lines.map(([k, n, v]) => {
                      const off = inp.infraOff && inp.infraOff[k];
                      return (
                        <tr key={k} className={off ? 'cap-row-off' : ''}>
                          <td>{n}</td>
                          <td className="cap-formula-cell">{off ? 'switched off in calculator' : formula[k]}</td>
                          <td style={{ textAlign: 'right' }}>{off ? <span className="cap-tag-off">Off</span> : inr(v)}</td>
                        </tr>
                      );
                    })}

                    <tr className="cap-total-row">
                      <td><b>Infrastructure = Monthly (excl. GST)</b></td>
                      <td>sum of the lines above</td>
                      <td style={{ textAlign: 'right' }}><b>{inr(res.monthly)}</b></td>
                    </tr>
                    <tr>
                      <td>GST on monthly</td>
                      <td>{inr(res.monthly)} × {g}%</td>
                      <td style={{ textAlign: 'right' }}>{inr(res.gst.monthly)}</td>
                    </tr>
                    <tr className="cap-total-row cap-highlight-row">
                      <td><b>Monthly payable</b></td>
                      <td>{inr(res.monthly)} + {inr(res.gst.monthly)}</td>
                      <td style={{ textAlign: 'right' }} className="cap-cell-highlight">{inr(res.monthlyTotal)}</td>
                    </tr>
                    <tr>
                      <td>Yearly (excl. GST)</td>
                      <td>{inr(res.monthly)} × 12 = {inr(res.yearGross)}, less {rates.yearDiscountPct}% discount</td>
                      <td style={{ textAlign: 'right' }}>{inr(res.yearly)}</td>
                    </tr>
                    <tr>
                      <td>Yearly payable</td>
                      <td>{inr(res.yearly)} + GST {g}% ({inr(res.gst.yearly)})</td>
                      <td style={{ textAlign: 'right' }}><b>{inr(res.yearlyTotal)}</b></td>
                    </tr>

                    {/* Section Header: One-Time */}
                    <tr className="cap-section-divider-row">
                      <td colSpan="3">
                        <span className="cap-table-section-title">One-time Investment</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Markup</td>
                      <td>{inr(res.infra)} infrastructure × {rates.markupPct}%</td>
                      <td style={{ textAlign: 'right' }}>{inr(res.markup)}</td>
                    </tr>
                    <tr>
                      <td>Users fee</td>
                      <td>{inp.users} × {inr(rates.perUser)}</td>
                      <td style={{ textAlign: 'right' }}>{inr(fees.users)}</td>
                    </tr>
                    <tr>
                      <td>Branches fee</td>
                      <td>{inp.branches} × {inr(rates.perBranch)}</td>
                      <td style={{ textAlign: 'right' }}>{inr(fees.branches)}</td>
                    </tr>
                    <tr>
                      <td>Clients fee</td>
                      <td>{inp.clients} × {inr(rates.perClient)}</td>
                      <td style={{ textAlign: 'right' }}>{inr(fees.clients)}</td>
                    </tr>
                    <tr>
                      <td>Backup module</td>
                      <td>{inp.backup ? 'on' : 'off → 0'}</td>
                      <td style={{ textAlign: 'right' }}>{inr(fees.backup)}</td>
                    </tr>
                    <tr>
                      <td>Live tracking module</td>
                      <td>{inp.tracking ? 'on' : 'off → 0'}</td>
                      <td style={{ textAlign: 'right' }}>{inr(fees.tracking)}</td>
                    </tr>
                    <tr>
                      <td>MFI module</td>
                      <td>{inp.mfi ? 'on' : 'off → 0'}</td>
                      <td style={{ textAlign: 'right' }}>{inr(fees.mfi)}</td>
                    </tr>
                    <tr>
                      <td>HR module</td>
                      <td>{inp.hr ? 'on' : 'off → 0'}</td>
                      <td style={{ textAlign: 'right' }}>{inr(fees.hr)}</td>
                    </tr>
                    <tr>
                      <td>Mobile app</td>
                      <td>{inp.mobileApp ? 'on' : 'off → 0'}</td>
                      <td style={{ textAlign: 'right' }}>{inr(fees.mobileApp)}</td>
                    </tr>
                    <tr>
                      <td>Jewel loan module</td>
                      <td>{inp.jewelLoan ? 'on' : 'off → 0'}</td>
                      <td style={{ textAlign: 'right' }}>{inr(fees.jewelLoan)}</td>
                    </tr>
                    <tr>
                      <td>Setup fee</td>
                      <td>fixed</td>
                      <td style={{ textAlign: 'right' }}>{inr(rates.setupFee)}</td>
                    </tr>
                    <tr className="cap-total-row">
                      <td><b>One-time (excl. GST)</b></td>
                      <td>markup + fees + setup</td>
                      <td style={{ textAlign: 'right' }}><b>{inr(res.oneTimeBase)}</b></td>
                    </tr>
                    <tr>
                      <td>GST on one-time</td>
                      <td>{inr(res.oneTimeBase)} × {g}%</td>
                      <td style={{ textAlign: 'right' }}>{inr(res.gst.oneTime)}</td>
                    </tr>
                    <tr className="cap-total-row cap-highlight-row">
                      <td><b>One-time payable</b></td>
                      <td>{inr(res.oneTimeBase)} + {inr(res.gst.oneTime)}</td>
                      <td style={{ textAlign: 'right' }} className="cap-cell-highlight">{inr(res.oneTimeTotal)}</td>
                    </tr>
                    <tr className="cap-margin-row">
                      <td><b>Your margin</b></td>
                      <td>markup {inr(res.markup)} + fees {inr(res.fees)} (before GST)</td>
                      <td style={{ textAlign: 'right' }} className="cap-cell-green"><b>{inr(res.profit)}</b></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* SECTION 5: Scale Projections ("What happens as the count increases") */}
          {(activeTab === 'all' || activeTab === 'projections') && (
            <section className="card cap-card">
              <div className="cap-card-header">
                <div className="cap-card-title-wrap">
                  <div className="cap-card-icon cap-icon-projections">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="cap-card-title">What happens as the count increases</h3>
                    <p className="cap-card-sub">Simulate scale and see where server and database plans automatically upgrade.</p>
                  </div>
                </div>
              </div>

              {/* Driver Selector Pills */}
              <div className="cap-driver-control-wrap">
                <div className="cap-driver-label-group">
                  <span className="cap-micro-label">Simulate Growth In:</span>
                  <div className="cap-driver-pills">
                    {Object.keys(STEPS).map((k) => (
                      <button
                        key={k}
                        type="button"
                        className={`cap-driver-pill ${driver === k ? 'active' : ''}`}
                        onClick={() => setDriver(k)}
                      >
                        {LABEL[k]}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="cap-fixed-hint">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Other values stay as set on the left
                </span>
              </div>

              <div className="cap-scroll">
                <table className="how-table cap-table cap-sim-table">
                  <thead>
                    <tr>
                      <th>{LABEL[driver]}</th>
                      <th>Server load</th>
                      <th>Server</th>
                      <th>DB</th>
                      <th>Storage</th>
                      <th>Map loads</th>
                      <th>Monthly (excl. GST)</th>
                      <th>Monthly (incl. GST)</th>
                      <th>One-time (incl. GST)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ v, res: r }, i) => {
                      const prev = rows[i - 1];
                      const up = prev && (prev.res.plan.name !== r.plan.name || prev.res.dbPlan.name !== r.dbPlan.name);
                      return (
                        <tr key={v} className={up ? 'cap-upgrade-row' : ''}>
                          <td>
                            <div className="cap-count-cell">
                              <b>{v.toLocaleString('en-IN')}</b>
                              {up && <span className="cap-upgrade-pill">Tier Up</span>}
                            </div>
                          </td>
                          <td><span className="cap-val-num">{r.load.toFixed(0)}</span></td>
                          <td>
                            <span className={`cap-tier-tag ${up && prev && prev.res.plan.name !== r.plan.name ? 'tier-changed' : ''}`}>
                              {r.plan.name}
                            </span>
                          </td>
                          <td>
                            <span className={`cap-tier-tag ${up && prev && prev.res.dbPlan.name !== r.dbPlan.name ? 'tier-changed' : ''}`}>
                              {r.dbPlan.name}
                            </span>
                          </td>
                          <td>{r.storageGB.toFixed(1)} GB</td>
                          <td>{fmt(r.mapLoads)}</td>
                          <td>{inr(r.monthly)}</td>
                          <td><b className="cap-cell-highlight">{inr(r.monthlyTotal)}</b></td>
                          <td>{inr(r.oneTimeTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="cap-upgrade-legend">
                <span className="cap-legend-dot" />
                <p className="cap-note">Highlighted rows indicate where the server or database plan steps up.</p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
