import { useMemo, useState } from 'react';
import { ALL_DB_PROVIDERS } from '../data/databasePricing/allDatabases.js';
import {
  deriveDbUsage,
  pickDbPlan,
  calcDbServiceCost,
  simulateDbScale,
  compareAllDatabases,
  DB_SCALE_STEPS,
  inrFmt,
  usdFmt,
} from '../utils/databaseCostCalculator.js';

// ─── default DB config driven by parent inp (users / branches / clients) ──────
const DEFAULT_DB_CFG = {
  customers: 500,
  users: 10,
  branches: 2,
  records: 25000,
  storageGB: '',
  dailyReads: '',
  dailyWrites: '',
  monthlyQueries: '',
  connections: '',
  avgQuerySizeKB: 4,
  dailyTransactions: '',
  monthlyGrowthGB: 2,
  backupGB: '',
  replicas: 0,
  ha: false,
};

const DB_SUB_TABS = [
  { id: 'billing',    label: 'DB Billing' },
  { id: 'comparison', label: 'DB Comparison' },
  { id: 'scale',      label: 'DB Scale Simulation' },
];

// ─── tiny helpers ──────────────────────────────────────────────────────────────
const pct = (used, total) => total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

function MeterBar({ value, max, label }) {
  const p = pct(value, max);
  const cls = p > 85 ? 'hot' : p > 65 ? 'warn' : '';
  return (
    <div className="cap-meter-wrap">
      <div className="cap-meter-track">
        <div className={`cap-meter-fill ${cls}`} style={{ width: `${p}%` }} />
      </div>
      <div className="cap-meter-labels">
        <span>{label}: <b>{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</b></span>
        <span>Limit: <b>{typeof max === 'number' ? max.toLocaleString('en-IN') : max}</b></span>
      </div>
    </div>
  );
}

function StatusPill({ p }) {
  const cls = p > 85 ? 'cap-status-danger' : p > 65 ? 'cap-status-warning' : 'cap-status-success';
  return <span className={`cap-status-pill ${cls}`}>{p}% used</span>;
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function DatabaseBillingTab({ sharedInp }) {
  // Sync top-level users / branches / clients from parent when they exist
  const [dbCfg, setDbCfg] = useState(() => ({
    ...DEFAULT_DB_CFG,
    customers: sharedInp?.clients  ?? DEFAULT_DB_CFG.customers,
    users:     sharedInp?.users    ?? DEFAULT_DB_CFG.users,
    branches:  sharedInp?.branches ?? DEFAULT_DB_CFG.branches,
  }));

  const [selectedProvider, setProvider] = useState('digitalocean');
  const [selectedServiceId, setService] = useState('do-managed-db');
  const [subTab, setSubTab]             = useState('billing');

  const setF = (k) => (e) => {
    const t = e.target;
    const v = t.type === 'checkbox'
      ? t.checked
      : t.type === 'number'
        ? (t.value === '' ? '' : Math.max(0, +t.value))
        : t.value;
    setDbCfg((p) => ({ ...p, [k]: v }));
  };

  // Merge sharedInp into dbCfg when parent changes (non-destructive)
  const mergedCfg = useMemo(() => ({
    ...dbCfg,
    customers: dbCfg.customers !== DEFAULT_DB_CFG.customers ? dbCfg.customers : (sharedInp?.clients ?? dbCfg.customers),
    users:     sharedInp?.users    ?? dbCfg.users,
    branches:  sharedInp?.branches ?? dbCfg.branches,
  }), [dbCfg, sharedInp]);

  const usage = useMemo(() => deriveDbUsage(mergedCfg), [mergedCfg]);

  // Active provider + service
  const provider = useMemo(
    () => ALL_DB_PROVIDERS.find((p) => p.id === selectedProvider) || ALL_DB_PROVIDERS[3],
    [selectedProvider]
  );
  const service = useMemo(() => {
    const found = provider.services.find((s) => s.id === selectedServiceId);
    return found || provider.services[0];
  }, [provider, selectedServiceId]);

  const cost = useMemo(() => calcDbServiceCost(service, usage), [service, usage]);
  const plan = cost.plan;

  const storagePct    = pct(usage.storageGB, plan.storage || Math.max(usage.storageGB, 1));
  const connectionPct = pct(usage.connections, plan.connections || Math.max(usage.connections, 1));

  // Comparison
  const comparisonResults = useMemo(
    () => compareAllDatabases(ALL_DB_PROVIDERS, usage),
    [usage]
  );

  // Scale simulation for active service
  const scaleRows = useMemo(
    () => simulateDbScale(service, mergedCfg),
    [service, mergedCfg]
  );

  const inr = inrFmt;

  return (
    <div>
      {/* ── DB Provider + Service Selector ── */}
      <section className="card cap-card" style={{ marginBottom: 16 }}>
        <div className="cap-card-header">
          <div className="cap-card-title-wrap">
            <div className="cap-card-icon cap-icon-db">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            </div>
            <div>
              <h3 className="cap-card-title">Database Billing Module</h3>
              <p className="cap-card-sub">Select a database provider and service. All costs recalculate from your client configuration.</p>
            </div>
          </div>
          <span className="cap-status-pill cap-status-blue">Est. Only</span>
        </div>

        {/* Provider chips */}
        <div className="dbb-providers-row">
          {ALL_DB_PROVIDERS.map((prov) => (
            <button
              key={prov.id}
              type="button"
              className={`mc-platform-chip ${selectedProvider === prov.id ? 'selected' : ''}`}
              style={selectedProvider === prov.id ? { borderColor: prov.color, backgroundColor: prov.bgColor, color: prov.color, fontWeight: 700 } : {}}
              onClick={() => {
                setProvider(prov.id);
                setService(prov.services[0]?.id || '');
              }}
            >
              {prov.name}
            </button>
          ))}
        </div>

        {/* Service selector */}
        <div className="dbb-service-row">
          <span className="cap-micro-label">Database Service:</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            {provider.services.map((svc) => (
              <button
                key={svc.id}
                type="button"
                className={`cap-driver-pill ${selectedServiceId === svc.id ? 'active' : ''}`}
                onClick={() => setService(svc.id)}
              >
                {svc.name}
              </button>
            ))}
          </div>
        </div>

        {/* DB Usage Inputs */}
        <div className="dbb-inputs-grid">
          {[
            { k: 'customers',         label: 'Customers / Members' },
            { k: 'records',           label: 'DB Records' },
            { k: 'storageGB',         label: 'Storage (GB)' },
            { k: 'backupGB',          label: 'Backup Storage (GB)' },
            { k: 'dailyReads',        label: 'Daily Read Ops' },
            { k: 'dailyWrites',       label: 'Daily Write Ops' },
            { k: 'monthlyQueries',    label: 'Monthly Queries' },
            { k: 'connections',       label: 'DB Connections' },
            { k: 'dailyTransactions', label: 'Daily Transactions' },
            { k: 'monthlyGrowthGB',   label: 'Monthly Growth (GB)' },
            { k: 'replicas',          label: 'DB Replicas' },
            { k: 'avgQuerySizeKB',    label: 'Avg Query Size (KB)' },
          ].map(({ k, label }) => (
            <div key={k} className="dbb-input-field">
              <label className="field-label">{label}</label>
              <input
                type="number"
                min="0"
                className="input-box"
                value={dbCfg[k]}
                onChange={setF(k)}
                placeholder="auto"
              />
            </div>
          ))}
          <div className="dbb-input-field" style={{ gridColumn: 'span 2' }}>
            <label className={`module-toggle-card ${dbCfg.ha ? 'active' : ''}`} style={{ marginTop: 4 }}>
              <div className="module-info">
                <div className="module-icon-wrap">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <span className="module-title">High Availability (Multi-AZ / Replica)</span>
                  <span className="module-hint">Doubles compute cost for supported providers</span>
                </div>
              </div>
              <span className="switch">
                <input type="checkbox" checked={dbCfg.ha} onChange={setF('ha')} />
                <span className="slider" />
              </span>
            </label>
          </div>
        </div>

        <div className="mc-platform-note">
          ⚠ {provider.note} · Region: {provider.region} · Currency: {provider.currency} · Last verified: {provider.lastVerified}
        </div>
      </section>

      {/* ── Sub-tab nav ── */}
      <nav className="cap-view-bar" aria-label="DB section">
        <span className="cap-view-bar-title">View:</span>
        <div className="cap-view-pills">
          {DB_SUB_TABS.map((t) => (
            <button key={t.id} type="button" className={`cap-view-pill ${subTab === t.id ? 'active' : ''}`} onClick={() => setSubTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ═══════════════════ SUB-TAB: DB BILLING ═══════════════════ */}
      {subTab === 'billing' && (
        <>
          {/* KPI cards */}
          <div className="dbb-kpi-row">
            <div className="cap-kpi-card">
              <div className="cap-kpi-top"><span className="cap-kpi-label">Selected Plan</span><StatusPill p={storagePct} /></div>
              <div className="cap-kpi-val" style={{ fontSize: 15 }}>{plan.name}</div>
              <div className="cap-kpi-sub">{plan.cpu} vCPU · {plan.ram} GB RAM · {plan.storage} GB storage</div>
            </div>
            <div className="cap-kpi-card">
              <div className="cap-kpi-top"><span className="cap-kpi-label">DB Connections</span><StatusPill p={connectionPct} /></div>
              <div className="cap-kpi-val" style={{ fontSize: 20 }}>{usage.connections}</div>
              <div className="cap-kpi-sub">Limit: {plan.connections?.toLocaleString('en-IN') || '—'}</div>
            </div>
            <div className="cap-kpi-card cap-kpi-highlight">
              <div className="cap-kpi-top"><span className="cap-kpi-label">Monthly DB Cost</span><span className="cap-status-pill cap-status-blue">Incl. GST</span></div>
              <div className="cap-kpi-val cap-val-blue">{inr(cost.totalWithGst)}</div>
              <div className="cap-kpi-sub">Base {inr(cost.totalInr)} + GST {inr(cost.gstInr)}</div>
            </div>
            <div className="cap-kpi-card">
              <div className="cap-kpi-top"><span className="cap-kpi-label">Annual DB Cost</span><span className="cap-status-pill cap-status-green">11 months</span></div>
              <div className="cap-kpi-val">{inr(cost.annualWithGst)}</div>
              <div className="cap-kpi-sub">Excl. GST: {inr(cost.annualInr)}</div>
            </div>
          </div>

          {/* Load meters */}
          <section className="card cap-card" style={{ marginBottom: 16 }}>
            <div className="cap-card-header">
              <div className="cap-card-title-wrap">
                <div className="cap-card-icon cap-icon-db">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3"/>
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                  </svg>
                </div>
                <div>
                  <h3 className="cap-card-title">{service.name} — {plan.name}</h3>
                  <p className="cap-card-sub">
                    {plan.cpu > 0 ? `${plan.cpu} vCPU · ${plan.ram} GB RAM · ` : ''}{plan.storage} GB included storage · {plan.connections?.toLocaleString('en-IN')} max connections
                  </p>
                </div>
              </div>
              <StatusPill p={storagePct} />
            </div>
            <MeterBar value={`${usage.storageGB.toFixed(1)} GB`} max={`${plan.storage} GB`} label="Storage used" />
            <div style={{ marginTop: 10 }}>
              <MeterBar value={usage.connections} max={plan.connections || 999} label="Connections" />
            </div>
            <div className="cap-formula-card" style={{ marginTop: 12 }}>
              <span className="cap-formula-title">Derived Usage (auto-calculated from customers = {usage.customers.toLocaleString('en-IN')}):</span>
              <div className="cap-formula-chips">
                <span className="cap-chip">Storage: {usage.storageGB.toFixed(1)} GB</span>
                <span className="cap-chip">Backup: {usage.backupGB.toFixed(1)} GB</span>
                <span className="cap-chip">Reads/day: {usage.dailyReads.toLocaleString('en-IN')}</span>
                <span className="cap-chip">Writes/day: {usage.dailyWrites.toLocaleString('en-IN')}</span>
                <span className="cap-chip">Connections: {usage.connections}</span>
                <span className="cap-chip">Transactions/day: {usage.dailyTx.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="cap-headroom-banner">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>
                Storage headroom: <b>{Math.max(0, (plan.storage || 0) - usage.storageGB).toFixed(1)} GB</b> remaining.
                Connection headroom: <b>{Math.max(0, (plan.connections || 0) - usage.connections)}</b> remaining.
              </span>
            </div>
          </section>

          {/* Cost Breakdown */}
          <section className="card cap-card" style={{ marginBottom: 16 }}>
            <div className="cap-card-header">
              <div className="cap-card-title-wrap">
                <div className="cap-card-icon cap-icon-price">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div>
                  <h3 className="cap-card-title">Database Cost Breakdown</h3>
                  <p className="cap-card-sub">Individual cost components. Zero-cost items are included in the base plan.</p>
                </div>
              </div>
            </div>
            <div className="cap-table-wrapper">
              <table className="how-table cap-table">
                <thead>
                  <tr>
                    <th>Cost Component</th>
                    <th>Billing Basis</th>
                    <th style={{ textAlign: 'right' }}>USD (Est.)</th>
                    <th style={{ textAlign: 'right' }}>INR (Est.)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'DB Compute',    usd: cost.computeUsd,     basis: `${plan.name} plan` },
                    { label: 'Storage',       usd: cost.storageUsd,     basis: `${Math.max(0, usage.storageGB - (plan.storage||0)).toFixed(1)} GB overage × ${usdFmt(plan.storagePerGB||0)}/GB` },
                    { label: 'Backup',        usd: cost.backupUsd,      basis: `${usage.backupGB.toFixed(1)} GB × ${usdFmt(plan.backupPerGB||0)}/GB` },
                    { label: 'IOPS',          usd: cost.iopsUsd,        basis: plan.iopsPerUnit ? `${usdFmt(plan.iopsPerUnit)}/K ops` : 'Included' },
                    { label: 'Read Ops',      usd: cost.readUsd,        basis: plan.readPerMillion ? `${usdFmt(plan.readPerMillion)}/M reads` : 'Included' },
                    { label: 'Write Ops',     usd: cost.writeUsd,       basis: plan.writePerMillion ? `${usdFmt(plan.writePerMillion)}/M writes` : 'Included' },
                    { label: 'Network',       usd: cost.networkUsd,     basis: `${usdFmt(plan.networkPerGB||0)}/GB transfer` },
                    { label: 'Replication',   usd: cost.replicationUsd, basis: `${usage.replicas} replica(s)` },
                    { label: 'High Availability', usd: cost.haUsd,      basis: usage.ha ? 'Multi-AZ enabled' : 'Disabled' },
                  ].map(({ label, usd, basis }) => (
                    <tr key={label} className={usd === 0 ? 'cap-row-off' : ''}>
                      <td><b>{label}</b></td>
                      <td className="cap-formula-cell">{basis}</td>
                      <td style={{ textAlign: 'right' }}>{usd > 0 ? usdFmt(usd) : <span className="cap-tag-off">Included</span>}</td>
                      <td style={{ textAlign: 'right' }}>{usd > 0 ? inr(usd * 93) : '—'}</td>
                    </tr>
                  ))}
                  <tr className="cap-total-row">
                    <td><b>Total (excl. GST)</b></td>
                    <td>sum above</td>
                    <td style={{ textAlign: 'right' }}><b>{usdFmt(cost.totalUsd)}</b></td>
                    <td style={{ textAlign: 'right' }}><b>{inr(cost.totalInr)}</b></td>
                  </tr>
                  <tr>
                    <td>GST (18%)</td>
                    <td>{inr(cost.totalInr)} × 18%</td>
                    <td style={{ textAlign: 'right' }}>{usdFmt(cost.gstInr / 93)}</td>
                    <td style={{ textAlign: 'right' }}>{inr(cost.gstInr)}</td>
                  </tr>
                  <tr className="cap-total-row cap-highlight-row">
                    <td><b>Monthly Payable</b></td>
                    <td />
                    <td style={{ textAlign: 'right' }}><b>{usdFmt(cost.totalWithGst / 93)}</b></td>
                    <td style={{ textAlign: 'right' }} className="cap-cell-highlight"><b>{inr(cost.totalWithGst)}</b></td>
                  </tr>
                  <tr>
                    <td>Annual (11 months)</td>
                    <td>1 month free</td>
                    <td style={{ textAlign: 'right' }}>{usdFmt(cost.annualWithGst / 93)}</td>
                    <td style={{ textAlign: 'right' }}><b>{inr(cost.annualWithGst)}</b></td>
                  </tr>
                  <tr>
                    <td>Per-customer / month</td>
                    <td>÷ {usage.customers.toLocaleString('en-IN')} customers</td>
                    <td />
                    <td style={{ textAlign: 'right' }}>
                      {usage.customers > 0
                        ? <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{inr(cost.totalWithGst / usage.customers)}</span>
                        : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ═══════════════════ SUB-TAB: COMPARISON ═══════════════════ */}
      {subTab === 'comparison' && (
        <section className="card cap-card">
          <div className="cap-card-header">
            <div className="cap-card-title-wrap">
              <div className="cap-card-icon cap-icon-storage">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
                </svg>
              </div>
              <div>
                <h3 className="cap-card-title">Database Cost Comparison — All Providers</h3>
                <p className="cap-card-sub">Ranked lowest to highest monthly cost for your current usage. Estimates only.</p>
              </div>
            </div>
          </div>
          <div className="cap-scroll">
            <table className="how-table cap-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Provider</th>
                  <th>Service</th>
                  <th>Plan</th>
                  <th>CPU</th>
                  <th>RAM</th>
                  <th>Storage</th>
                  <th style={{ textAlign: 'right' }}>Compute (USD)</th>
                  <th style={{ textAlign: 'right' }}>Monthly (GST)</th>
                  <th style={{ textAlign: 'right' }}>Annual (11mo)</th>
                </tr>
              </thead>
              <tbody>
                {comparisonResults.map(({ provider: prov, service: svc, cost: c }, idx) => (
                  <tr key={`${prov.id}-${svc.id}`} className={idx === 0 ? 'mc-cheapest-row' : ''}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {idx === 0 ? '🏆' : idx + 1}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: prov.color }}>{prov.name}</span>
                      {idx === 0 && <span className="mc-plan-badge mc-cheapest-badge" style={{ marginLeft: 6 }}>Lowest</span>}
                    </td>
                    <td style={{ fontSize: 12 }}>{svc.name}</td>
                    <td style={{ fontSize: 12 }}><b>{c.plan.name}</b></td>
                    <td>{c.plan.cpu > 0 ? `${c.plan.cpu} vCPU` : '—'}</td>
                    <td>{c.plan.ram > 0 ? `${c.plan.ram} GB` : '—'}</td>
                    <td>{c.plan.storage} GB</td>
                    <td style={{ textAlign: 'right' }}>{usdFmt(c.computeUsd)}</td>
                    <td style={{ textAlign: 'right' }}><b>{inr(c.totalWithGst)}</b></td>
                    <td style={{ textAlign: 'right' }}>{inr(c.annualWithGst)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {comparisonResults.length > 1 && (
            <div className="mc-insights-row" style={{ marginTop: 14 }}>
              <div className="mc-insight-card">
                <span className="mc-insight-label">Cheapest</span>
                <span className="mc-insight-val">{comparisonResults[0].provider.name}</span>
                <span className="mc-insight-sub">{inr(comparisonResults[0].cost.totalWithGst)}/mo</span>
              </div>
              <div className="mc-insight-card">
                <span className="mc-insight-label">Most Expensive</span>
                <span className="mc-insight-val">{comparisonResults[comparisonResults.length - 1].provider.name}</span>
                <span className="mc-insight-sub">{inr(comparisonResults[comparisonResults.length - 1].cost.totalWithGst)}/mo</span>
              </div>
              <div className="mc-insight-card">
                <span className="mc-insight-label">Cost Difference</span>
                <span className="mc-insight-val">{inr(comparisonResults[comparisonResults.length - 1].cost.totalWithGst - comparisonResults[0].cost.totalWithGst)}</span>
                <span className="mc-insight-sub">cheapest vs most expensive</span>
              </div>
              <div className="mc-insight-card">
                <span className="mc-insight-label">Annual Saving</span>
                <span className="mc-insight-val">{inr((comparisonResults[comparisonResults.length - 1].cost.annualWithGst - comparisonResults[0].cost.annualWithGst))}</span>
                <span className="mc-insight-sub">by choosing cheapest</span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ═══════════════════ SUB-TAB: SCALE SIMULATION ═══════════════════ */}
      {subTab === 'scale' && (
        <section className="card cap-card">
          <div className="cap-card-header">
            <div className="cap-card-title-wrap">
              <div className="cap-card-icon cap-icon-projections">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <div>
                <h3 className="cap-card-title">Database Scale Simulation</h3>
                <p className="cap-card-sub">What happens to DB cost and resource requirements as customers grow. Using: <b>{service.name}</b></p>
              </div>
            </div>
          </div>
          <div className="cap-scroll">
            <table className="how-table cap-table cap-sim-table">
              <thead>
                <tr>
                  <th>Customers</th>
                  <th>Storage (GB)</th>
                  <th>Backup (GB)</th>
                  <th>Reads/day</th>
                  <th>Writes/day</th>
                  <th>Connections</th>
                  <th>DB Plan</th>
                  <th>Monthly (excl. GST)</th>
                  <th>Monthly (incl. GST)</th>
                  <th>Annual (incl. GST)</th>
                </tr>
              </thead>
              <tbody>
                {scaleRows.map(({ customers, usage: u, cost: c }, i) => {
                  const prev = scaleRows[i - 1];
                  const tierUp = prev && prev.cost.plan.name !== c.plan.name;
                  return (
                    <tr key={customers} className={tierUp ? 'cap-upgrade-row' : ''}>
                      <td>
                        <div className="cap-count-cell">
                          <b>{customers.toLocaleString('en-IN')}</b>
                          {tierUp && <span className="cap-upgrade-pill">Tier Up</span>}
                        </div>
                      </td>
                      <td>{u.storageGB.toFixed(1)}</td>
                      <td>{u.backupGB.toFixed(1)}</td>
                      <td>{u.dailyReads.toLocaleString('en-IN')}</td>
                      <td>{u.dailyWrites.toLocaleString('en-IN')}</td>
                      <td>{u.connections}</td>
                      <td>
                        <span className={`cap-tier-tag ${tierUp ? 'tier-changed' : ''}`}>{c.plan.name}</span>
                      </td>
                      <td>{inr(c.totalInr)}</td>
                      <td><b className="cap-cell-highlight">{inr(c.totalWithGst)}</b></td>
                      <td>{inr(c.annualWithGst)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="cap-upgrade-legend">
            <span className="cap-legend-dot" />
            <p className="cap-note">Highlighted rows show where the database plan upgrades. Figures are estimates only.</p>
          </div>
        </section>
      )}
    </div>
  );
}
