import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_RATES, calculate } from './pricing.js';

const BASE = {
  client: '', mode: 'separate', users: 10, branches: 2, clients: 500,
  backup: true, tracking: true, trackedUsers: 5, mfi: true,
};

const read = (k, d) => {
  try {
    return { ...d, ...JSON.parse(localStorage.getItem(k)) };
  } catch {
    return d;
  }
};

const STEPS = {
  users: [5, 10, 20, 50, 100, 200, 500, 1000],
  branches: [1, 2, 5, 10, 20, 50, 100, 200],
  clients: [100, 500, 1000, 5000, 10000, 25000, 50000, 100000],
  trackedUsers: [0, 5, 10, 25, 50, 100, 200, 500],
};
const LABEL = { users: 'Users', branches: 'Branches', clients: 'Clients', trackedUsers: 'Live-tracked users' };

const Bar = ({ pct, label }) => (
  <div className="cap-bar-wrap">
    <div className="cap-bar"><div className={`cap-bar-fill ${pct > 85 ? 'hot' : ''}`} style={{ width: Math.min(100, pct) + '%' }} /></div>
    <span className="cap-bar-label">{label}</span>
  </div>
);

export default function Capacity() {
  const rates = useMemo(() => read('sp_rates', DEFAULT_RATES), []);
  const [inp, setInp] = useState(() => read('sp_inp', BASE));
  const [driver, setDriver] = useState('clients');
  const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const fmt = (n) => Math.round(n).toLocaleString('en-IN');

  // keep the calculator and this page in sync
  useEffect(() => {
    try {
      localStorage.setItem('sp_inp', JSON.stringify(inp));
    } catch {
      /* ignore */
    }
  }, [inp]);

  const set = (k) => (e) => {
    const t = e.target;
    setInp({ ...inp, [k]: t.type === 'checkbox' ? t.checked : t.type === 'number' ? Math.max(0, +t.value) : t.value });
  };

  const calc = (o) => calculate({ ...o, mode: 'separate' }, rates);
  const res = calc(inp);
  const tracked = inp.tracking ? Math.min(inp.trackedUsers, inp.users) : 0;
  const dbLoad = inp.clients / 10 + inp.users * 2 + tracked * 20;

  // smallest value of a count at which the server / DB plan changes (binary search, load is monotonic)
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
  };

  const fx = rates.usdToInr;
  const g = rates.gstPct ?? 18;
  const extraGB = Math.max(0, res.storageGB - 250);
  const d = (n) => '$' + (+n.toFixed(2));
  const formula = {
    linode: `${d(res.plan.usd)} × ₹${fx}`,
    linodeBackup: inp.backup ? `${d(res.plan.usd)} × ${rates.linodeBackupPct}% × ₹${fx}` : 'Backup off → 0',
    db: `${d(res.dbPlan.usd)} × ₹${fx}`,
    storage: `(${d(rates.spacesUsdPer250GB)} + ${extraGB.toFixed(1)} GB extra × ${d(rates.spacesExtraUsdPerGB)}) × ₹${fx}`,
    map: `${fmt(res.mapLoads)} loads ÷ 1000 × ${d(rates.mapUsdPer1000)} × ₹${fx}`,
  };

  const rows = STEPS[driver].map((v) => {
    const o = { ...inp, [driver]: v };
    if (driver === 'trackedUsers') o.tracking = v > 0;
    return { v, res: calc(o) };
  });

  const UpRow = ({ label, which, keys }) => (
    <tr>
      <td>{label}</td>
      {keys.map((k) => {
        const v = upgradeAt(k, which);
        return <td key={k}>{v === null ? 'max plan' : `${fmt(v)} ${LABEL[k].toLowerCase()}`}</td>;
      })}
    </tr>
  );

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-text">
          <h1>Capacity</h1>
          <p>Set the numbers on the left and see exactly what server, database, storage and price you get.</p>
        </div>
      </header>

      <div className="main-grid">
        {/* Inputs */}
        <section className="card input">
          <div className="section-title"><span>Client Configuration</span></div>
          <div className="field-group">
            <label className="field-label" htmlFor="cap-client">Client name</label>
            <input id="cap-client" className="input-box" value={inp.client} onChange={set('client')} placeholder="e.g. ABC Finance" />
          </div>
          <div className="field-group">
            <label className="field-label">Scale &amp; Capacity</label>
            <div className="cap-inputs">
              <label>Users<input type="number" className="input-box" value={inp.users} onChange={set('users')} /></label>
              <label>Branches<input type="number" className="input-box" value={inp.branches} onChange={set('branches')} /></label>
              <label>Clients<input type="number" className="input-box" value={inp.clients} onChange={set('clients')} /></label>
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Modules</label>
            <label className="cap-check"><input type="checkbox" checked={inp.backup} onChange={set('backup')} /> Backup</label>
            <label className="cap-check"><input type="checkbox" checked={inp.tracking} onChange={set('tracking')} /> Live tracking</label>
            {inp.tracking && (
              <label className="cap-sub">Tracked users
                <input type="number" className="input-box" value={inp.trackedUsers} onChange={set('trackedUsers')} />
              </label>
            )}
            <label className="cap-check"><input type="checkbox" checked={inp.mfi} onChange={set('mfi')} /> MFI</label>
          </div>
          <p className="cap-note">These values are shared with the Calculator page.</p>
        </section>

        {/* Details */}
        <div className="how-grid">
          <section className="card how-card">
            <h3>Server (Linode)</h3>
            <p><b>{res.plan.name}</b> — {d(res.plan.usd)} × ₹{fx} = {inr(res.plan.usd * fx)}/month. Picked because it is the smallest plan with capacity ≥ load.</p>
            <Bar pct={(res.load / res.plan.cap) * 100} label={`Load ${res.load.toFixed(0)} of ${res.plan.cap} (${Math.round((res.load / res.plan.cap) * 100)}% used)`} />
            <code>{inp.users} users + {inp.clients} ÷ 50 + {inp.branches} × 2 + {tracked} × 3{inp.mfi ? ` + ${inp.users} × 0.5` : ''} = {res.load.toFixed(1)}</code>
            <p className="cap-note">Headroom: {Math.max(0, res.plan.cap - res.load).toFixed(0)} load points{isTop(rates.plans, res.plan) && res.load > res.plan.cap ? ' — over the biggest plan, needs more than one server' : ''}.</p>
          </section>

          <section className="card how-card">
            <h3>Database (DigitalOcean)</h3>
            <p><b>{res.dbPlan.name}</b> — {d(res.dbPlan.usd)} × ₹{fx} = {inr(res.dbPlan.usd * fx)}/month. Picked because it is the smallest DB plan with capacity ≥ load.</p>
            <Bar pct={(dbLoad / res.dbPlan.cap) * 100} label={`Load ${dbLoad.toFixed(0)} of ${res.dbPlan.cap} (${Math.round((dbLoad / res.dbPlan.cap) * 100)}% used)`} />
            <code>{inp.clients} ÷ 10 + {inp.users} × 2 + {tracked} × 20 = {dbLoad.toFixed(1)}</code>
          </section>

          <section className="card how-card">
            <h3>When will it need an upgrade?</h3>
            <p>Smallest count (others unchanged) at which the plan steps up:</p>
            <table className="how-table">
              <thead><tr><th></th><th>Users</th><th>Branches</th><th>Clients</th></tr></thead>
              <tbody>
                <UpRow label={`Server → next after ${res.plan.name}`} which="server" keys={['users', 'branches', 'clients']} />
                <UpRow label={`DB → next after ${res.dbPlan.name}`} which="db" keys={['users', 'branches', 'clients']} />
              </tbody>
            </table>
            <p className="cap-note">"max plan" means the count alone can't push it to a bigger plan (for example branches don't affect the database).</p>
          </section>

          <section className="card how-card">
            <h3>Storage &amp; map</h3>
            <table className="how-table"><thead><tr><th>Item</th><th>Formula with your counts</th><th>Result</th></tr></thead><tbody>
              <tr><td>Client data (docs / photos)</td><td>{inp.clients} clients × {rates.mbPerClient} MB ÷ 1024 + {tracked} tracked × 0.3 GB</td><td>{res.dataGB.toFixed(2)} GB</td></tr>
              <tr><td>Total stored</td><td>{inp.backup ? `${res.dataGB.toFixed(2)} GB × 3 backup copies` : `${res.dataGB.toFixed(2)} GB × 1 (no backup)`}</td><td>{res.storageGB.toFixed(2)} GB</td></tr>
              <tr><td>Extra beyond 250 GB</td><td>max(0, {res.storageGB.toFixed(2)} − 250)</td><td>{extraGB.toFixed(2)} GB</td></tr>
              <tr><td>Map loads / month</td><td>{tracked} tracked × {rates.mapLoadsPerUserPerDay} per day × {rates.workDaysPerMonth} days</td><td>{fmt(res.mapLoads)}</td></tr>
            </tbody></table>
          </section>

          <section className="card how-card">
            <h3>Price</h3>
            <div className="cap-scroll">
            <table className="how-table cap-table"><thead><tr><th>Item</th><th>Formula with your counts</th><th>Amount</th></tr></thead><tbody>
              {res.lines.map(([k, n, v]) => {
                const off = inp.infraOff && inp.infraOff[k];
                return <tr key={k}><td>{n}</td><td>{off ? 'switched off in calculator' : formula[k]}</td><td>{off ? 'Off' : inr(v)}</td></tr>;
              })}
              <tr className="cap-total"><td>Infrastructure = Monthly (excl. GST)</td><td>sum of the lines above</td><td>{inr(res.monthly)}</td></tr>
              <tr><td>GST on monthly</td><td>{inr(res.monthly)} × {g}%</td><td>{inr(res.gst.monthly)}</td></tr>
              <tr className="cap-total"><td>Monthly payable</td><td>{inr(res.monthly)} + {inr(res.gst.monthly)}</td><td>{inr(res.monthlyTotal)}</td></tr>
              <tr><td>Yearly (excl. GST)</td><td>{inr(res.monthly)} × 12 = {inr(res.yearGross)}, less {rates.yearDiscountPct}% discount</td><td>{inr(res.yearly)}</td></tr>
              <tr><td>Yearly payable</td><td>{inr(res.yearly)} + GST {g}% ({inr(res.gst.yearly)})</td><td>{inr(res.yearlyTotal)}</td></tr>
              <tr><td colSpan="3"><b>One-time</b></td></tr>
              <tr><td>Markup</td><td>{inr(res.infra)} infrastructure × {rates.markupPct}%</td><td>{inr(res.markup)}</td></tr>
              <tr><td>Users fee</td><td>{inp.users} × {inr(rates.perUser)}</td><td>{inr(fees.users)}</td></tr>
              <tr><td>Branches fee</td><td>{inp.branches} × {inr(rates.perBranch)}</td><td>{inr(fees.branches)}</td></tr>
              <tr><td>Clients fee</td><td>{inp.clients} × {inr(rates.perClient)}</td><td>{inr(fees.clients)}</td></tr>
              <tr><td>Backup module</td><td>{inp.backup ? 'on' : 'off → 0'}</td><td>{inr(fees.backup)}</td></tr>
              <tr><td>Live tracking module</td><td>{inp.tracking ? 'on' : 'off → 0'}</td><td>{inr(fees.tracking)}</td></tr>
              <tr><td>MFI module</td><td>{inp.mfi ? 'on' : 'off → 0'}</td><td>{inr(fees.mfi)}</td></tr>
              <tr><td>Setup fee</td><td>fixed</td><td>{inr(rates.setupFee)}</td></tr>
              <tr><td>One-time (excl. GST)</td><td>markup + fees + setup</td><td>{inr(res.oneTimeBase)}</td></tr>
              <tr><td>GST on one-time</td><td>{inr(res.oneTimeBase)} × {g}%</td><td>{inr(res.gst.oneTime)}</td></tr>
              <tr className="cap-total"><td>One-time payable</td><td>{inr(res.oneTimeBase)} + {inr(res.gst.oneTime)}</td><td>{inr(res.oneTimeTotal)}</td></tr>
              <tr><td>Your margin</td><td>markup {inr(res.markup)} + fees {inr(res.fees)} (before GST)</td><td>{inr(res.profit)}</td></tr>
            </tbody></table>
            </div>
          </section>

          <section className="card how-card">
            <h3>What happens as the count increases</h3>
            <div className="cap-controls">
              <label>Increase:&nbsp;
                <select className="select-box" value={driver} onChange={(e) => setDriver(e.target.value)}>
                  {Object.keys(STEPS).map((k) => <option key={k} value={k}>{LABEL[k]}</option>)}
                </select>
              </label>
              <span className="cap-fixed">other values stay as set on the left</span>
            </div>
            <div className="cap-scroll">
              <table className="how-table cap-table">
                <thead>
                  <tr>
                    <th>{LABEL[driver]}</th><th>Server load</th><th>Server</th><th>DB</th>
                    <th>Storage</th><th>Map loads</th><th>Monthly (excl. GST)</th><th>Monthly (incl. GST)</th><th>One-time (incl. GST)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ v, res: r }, i) => {
                    const prev = rows[i - 1];
                    const up = prev && (prev.res.plan.name !== r.plan.name || prev.res.dbPlan.name !== r.dbPlan.name);
                    return (
                      <tr key={v} className={up ? 'cap-upgrade' : ''}>
                        <td><b>{v.toLocaleString('en-IN')}</b></td>
                        <td>{r.load.toFixed(0)}</td>
                        <td>{r.plan.name}</td>
                        <td>{r.dbPlan.name}</td>
                        <td>{r.storageGB.toFixed(1)} GB</td>
                        <td>{fmt(r.mapLoads)}</td>
                        <td>{inr(r.monthly)}</td>
                        <td><b>{inr(r.monthlyTotal)}</b></td>
                        <td>{inr(r.oneTimeTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="cap-note">Highlighted rows are where the server or database plan steps up.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
