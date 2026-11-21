import { useState } from 'react';
import { DEFAULT_RATES } from '../models/pricing.model.js';

const getRates = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('sp_rates')) || {};
    if (!saved.usdToInr || saved.usdToInr === 85) {
      saved.usdToInr = 93;
      try {
        localStorage.setItem('sp_rates', JSON.stringify({ ...DEFAULT_RATES, ...saved }));
      } catch {}
    }
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

const SECTIONS = [
  { id: 'all', label: 'All Topics' },
  { id: 'model', label: '1. Billing Model' },
  { id: 'compute', label: '2. Server & DB Sizing' },
  { id: 'storage', label: '3. Storage & Maps' },
  { id: 'fees', label: '4. Fees & Margins' },
];

export default function HowItWorks() {
  const r = getRates();
  const [activeTab, setActiveTab] = useState('all');
  const money = (n) => '₹' + Number(n).toLocaleString('en-IN');
  const fx = r.usdToInr || 93;

  const exampleLoads = 250 * (r.mapJsPerUserPerDay + r.mapRoadsPerUserPerDay) * r.workDaysPerMonth;
  const exampleUsd =
    (Math.max(0, 250 * r.mapJsPerUserPerDay * r.workDaysPerMonth - r.mapFree.js) / 1000) * r.mapUsdPer1000 +
    (Math.max(0, 250 * r.mapRoadsPerUserPerDay * r.workDaysPerMonth - r.mapFree.roads) / 1000) * r.roadsUsdPer1000;
  const exampleInr = Math.round(exampleUsd * fx);

  return (
    <div className="app-wrapper how-page-wrapper">
      {/* Header */}
      <header className="app-header how-header">
        <div className="header-icon-box how-header-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div className="header-text">
          <div className="how-header-row">
            <h1>How the Price is Calculated</h1>
            <span className="how-badge-live">Live Rates Configuration</span>
          </div>
          <p>Values shown reflect your active system assumptions. You can adjust them anytime in the Calculator under "Edit rates".</p>
        </div>
      </header>

      {/* Assumptions Ribbon */}
      <section className="how-rates-ribbon">
        <div className="how-rate-pill">
          <span className="how-rate-k">USD → INR:</span>
          <b>₹{r.usdToInr}</b>
        </div>
        <div className="how-rate-pill">
          <span className="how-rate-k">Markup:</span>
          <b>{r.markupPct}%</b>
        </div>
        <div className="how-rate-pill">
          <span className="how-rate-k">Annual Discount:</span>
          <b>{r.yearDiscountPct}%</b>
        </div>
        <div className="how-rate-pill">
          <span className="how-rate-k">GST:</span>
          <b>{r.gstPct ?? 18}%</b>
        </div>
        <div className="how-rate-pill">
          <span className="how-rate-k">Setup Fee:</span>
          <b>{money(r.setupFee)}</b>
        </div>
        <a href="#/calculator" className="how-rate-link">
          Edit Rates in Calculator →
        </a>
      </section>

      {/* Navigation Filter Tabs */}
      <nav className="how-nav-bar" aria-label="Topic navigation">
        <span className="how-nav-title">Jump to:</span>
        <div className="how-nav-pills">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              className={`how-nav-pill ${activeTab === sec.id ? 'active' : ''}`}
              onClick={() => setActiveTab(sec.id)}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Grid */}
      <div className="how-sections-stack">
        {/* =================================================================
            CATEGORY 1: BILLING MODEL & SUMMARY
            ================================================================= */}
        {(activeTab === 'all' || activeTab === 'model') && (
          <div className="how-category-group">
            <div className="how-category-header">
              <span className="how-category-tag">Stage 1</span>
              <h2>Billing Structure &amp; Payment Model</h2>
            </div>

            {/* Step 1 */}
            <section className="card how-card how-featured-card">
              <div className="how-card-head">
                <span className="how-num">1</span>
                <div>
                  <h3>Summary of what the client pays</h3>
                  <p className="how-card-sub">Clear separation between recurring infrastructure costs and one-time licensing.</p>
                </div>
              </div>

              <div className="how-summary-grid">
                <div className="how-summary-box box-monthly">
                  <div className="how-box-top">
                    <span className="how-box-badge">Recurring</span>
                    <h4>Monthly</h4>
                  </div>
                  <p><b>Server infrastructure cost only.</b> Covers Linode app servers, DigitalOcean managed DB, object storage, and Google Maps API.</p>
                </div>

                <div className="how-summary-box box-yearly">
                  <div className="how-box-top">
                    <span className="how-box-badge badge-green">Save {r.yearDiscountPct}%</span>
                    <h4>Yearly</h4>
                  </div>
                  <p><b>Monthly × 12</b>, less a <b>{r.yearDiscountPct}% annual discount</b> when paid upfront.</p>
                </div>

                <div className="how-summary-box box-onetime">
                  <div className="how-box-top">
                    <span className="how-box-badge badge-indigo">Paid Once</span>
                    <h4>One-time payment</h4>
                  </div>
                  <p><b>Markup + User / Branch / Client / Module fees</b> + Initial Setup fee (<b>{money(r.setupFee)}</b>).</p>
                </div>

                <div className="how-summary-box box-gst">
                  <div className="how-box-top">
                    <span className="how-box-badge badge-amber">Statutory Tax</span>
                    <h4>GST ({r.gstPct ?? 18}%)</h4>
                  </div>
                  <p><b>GST {r.gstPct ?? 18}%</b> is added on top of all monthly, yearly, and one-time payments.</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =================================================================
            CATEGORY 2: COMPUTE & DATABASE SIZING
            ================================================================= */}
        {(activeTab === 'all' || activeTab === 'compute') && (
          <div className="how-category-group">
            <div className="how-category-header">
              <span className="how-category-tag">Stage 2</span>
              <h2>Compute &amp; Database Sizing</h2>
            </div>

            {/* Step 2 */}
            <section className="card how-card">
              <div className="how-card-head">
                <span className="how-num">2</span>
                <div>
                  <h3>Load → picks the server size (Linode)</h3>
                  <p className="how-card-sub">A capacity score balances active users, client transactions, branch nodes, and tracking overhead.</p>
                </div>
              </div>

              <div className="how-formula-banner">
                <span className="how-formula-label">Server Load Calculation:</span>
                <code>calls/day = users × (base {r.callsPerUserPerDay.base} + MFI {r.callsPerUserPerDay.mfi} + Mobile app {r.callsPerUserPerDay.mobileApp} + HR {r.callsPerUserPerDay.hr} + Jewel {r.callsPerUserPerDay.jewelLoan}) + trackedUsers × {r.callsPerUserPerDay.tracking}</code><code>load = calls/day × {r.peakShare} (peak/min) ÷ {r.callsPerLoadPoint}</code>
              </div>

              <p className="how-body-text">
                The smallest Linode plan whose <b>capacity ≥ load</b> is automatically chosen:
              </p>

              <div className="how-tiers-grid">
                {r.plans.map((p) => (
                  <div key={p.name} className="how-tier-card">
                    <div className="how-tier-top">
                      <span className="how-tier-name">{p.name}</span>
                      <span className="how-tier-cap">Cap: <b>{p.cap}</b></span>
                    </div>
                    <div className="how-tier-price">
                      <b>${p.usd}</b> / mo
                      <small>≈ {money(p.usd * fx)}</small>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Step 3 */}
            <section className="card how-card">
              <div className="how-card-head">
                <span className="how-num">3</span>
                <div>
                  <h3>Database (DigitalOcean Managed DB)</h3>
                  <p className="how-card-sub">High-frequency location pings and client account records scale database load independently.</p>
                </div>
              </div>

              <div className="how-formula-banner">
                <span className="how-formula-label">Database Load Calculation:</span>
                <code>dbLoad = clients ÷ 50 + calls/day ÷ {r.dbCallsPerLoadPoint}</code>
              </div>

              <p className="how-body-text">
                The smallest DigitalOcean managed database plan whose <b>capacity ≥ dbLoad</b> is automatically chosen:
              </p>

              <div className="how-tiers-grid how-tiers-db">
                {r.dbPlans.map((p) => (
                  <div key={p.name} className="how-tier-card">
                    <div className="how-tier-top">
                      <span className="how-tier-name">{p.name}</span>
                      <span className="how-tier-cap">Cap: <b>{p.cap}</b></span>
                    </div>
                    <div className="how-tier-price">
                      <b>${p.usd}</b> / mo
                      <small>≈ {money(p.usd * fx)}</small>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Step 4 */}
            <section className="card how-card">
              <div className="how-card-head">
                <span className="how-num">4</span>
                <div>
                  <h3>Linode Backups</h3>
                  <p className="how-card-sub">Automated daily snapshot images of the server disk.</p>
                </div>
              </div>

              <div className="how-formula-banner">
                <span className="how-formula-label">Backup Pricing Rule:</span>
                <code>Only if Backup is on: plan price × {r.linodeBackupPct}%</code>
              </div>
              <p className="how-body-text">
                Provides automated system snapshots and one-click restore capabilities directly via Linode Cloud.
              </p>
            </section>
          </div>
        )}

        {/* =================================================================
            CATEGORY 3: STORAGE & GOOGLE MAPS API
            ================================================================= */}
        {(activeTab === 'all' || activeTab === 'storage') && (
          <div className="how-category-group">
            <div className="how-category-header">
              <span className="how-category-tag">Stage 3</span>
              <h2>Storage &amp; Google Maps API</h2>
            </div>

            {/* Step 5 */}
            <section className="card how-card">
              <div className="how-card-head">
                <span className="how-num">5</span>
                <div>
                  <h3>Cloud storage (DigitalOcean Spaces)</h3>
                  <p className="how-card-sub">Document uploads, client KYC photos, and off-site backup storage archives.</p>
                </div>
              </div>

              <div className="how-formula-stack">
                <div className="how-formula-banner">
                  <span className="how-formula-label">Raw Data Volume:</span>
                  <code>data GB = clients × {r.mbPerClient} MB ÷ 1024 + trackedUsers × 0.3</code>
                </div>
                <div className="how-formula-banner">
                  <span className="how-formula-label">Storage Retention Policy:</span>
                  <code>With Backup on: storage = data × 3 (3 retained snapshot copies)</code>
                </div>
                <div className="how-formula-banner">
                  <span className="how-formula-label">Object Storage Billing:</span>
                  <code>cost = ${r.spacesUsdPer250GB} for first 250 GB + ${r.spacesExtraUsdPerGB}/GB beyond</code>
                </div>
              </div>
            </section>

            {/* Step 6 */}
            <section className="card how-card">
              <div className="how-card-head">
                <span className="how-num">6</span>
                <div>
                  <h3>Map charge (Live Field Tracking)</h3>
                  <p className="how-card-sub">Route recording, live GPS map views, and field agent location tracking.</p>
                </div>
              </div>

              {/* Estimate in Calculator */}
              <div className="how-sub-block">
                <h4>How the calculator estimates it:</h4>
                <div className="how-formula-banner">
                  <code>calls = trackedUsers × ({r.mapJsPerUserPerDay} map loads + {r.mapRoadsPerUserPerDay} roads) per day × {r.workDaysPerMonth} days</code>
                  <code>cost = (calls − Google free tier) ÷ 1000 × price per API (maps ${r.mapUsdPer1000}, roads ${r.roadsUsdPer1000})</code>
                </div>

                <div className="how-example-card">
                  <span className="how-example-badge">Example</span>
                  <p>
                    <b>250 tracked users</b> (Sarvam) → 250 × {r.mapJsPerUserPerDay + r.mapRoadsPerUserPerDay} calls/day × {r.workDaysPerMonth} work days = <b>{Math.round(exampleLoads).toLocaleString()} calls</b>.
                    <br />
                    Cost: <b>${exampleUsd.toFixed(2)}</b> (about <b>{money(exampleInr)}</b>).
                    <br />
                    <span className="how-note-text">Rates come from Sarvam's real usage report (14–20 Nov 2026). Google's monthly free allowance (Maps 10,000, Roads 5,000) is subtracted.</span>
                  </p>
                </div>
              </div>

              {/* Real Google SKU Usage */}
              <div className="how-sub-block" style={{ marginTop: '16px' }}>
                <h4>How Google actually charges (real usage from the Google Cloud project):</h4>

                <div className="how-table-wrapper">
                  <table className="how-table">
                    <thead>
                      <tr>
                        <th>Google service</th>
                        <th>Used for</th>
                        <th>Last 30 days</th>
                        <th>Nov 1 – 17</th>
                        <th>Free / month</th>
                        <th>Price after free</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><b>Maps SDK for Android</b></td>
                        <td>Map in the mobile app</td>
                        <td>3,883</td>
                        <td>3,015</td>
                        <td><span className="how-free-tag">Unlimited</span></td>
                        <td><b>Free</b></td>
                      </tr>
                      <tr>
                        <td><b>Maps JavaScript API</b></td>
                        <td>Map on the website</td>
                        <td>10,330</td>
                        <td>617</td>
                        <td>10,000</td>
                        <td>≈ $7 / 1000</td>
                      </tr>
                      <tr>
                        <td><b>Places API</b></td>
                        <td>Search, autocomplete, place details</td>
                        <td>6,567</td>
                        <td>3,414</td>
                        <td>5,000 – 10,000*</td>
                        <td>≈ $2.83 – $32 / 1000*</td>
                      </tr>
                      <tr>
                        <td><b>Roads API</b></td>
                        <td>Snap GPS tracking path to roads</td>
                        <td>4,630</td>
                        <td>4,630</td>
                        <td>5,000 – 10,000*</td>
                        <td>≈ $10 / 1000*</td>
                      </tr>
                      <tr>
                        <td><b>Routes API</b></td>
                        <td>Distance / ETA between points</td>
                        <td>178</td>
                        <td>67</td>
                        <td>10,000</td>
                        <td>≈ $5 / 1000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="how-bullet-list">
                  <div className="how-bullet-item">
                    <span className="how-bullet-dot" />
                    <span>Only successful calls (2xx) are billed. Error calls (4xx) are not billed.</span>
                  </div>
                  <div className="how-bullet-item">
                    <span className="how-bullet-dot" />
                    <span>Free allowance resets on the 1st of every month, individually per service.</span>
                  </div>
                  <div className="how-bullet-item">
                    <span className="how-bullet-dot" />
                    <span>*Depends on the exact SKU used. Prices are approximate from Google's published list; check <b>Cloud Console → Billing → Reports → Group by SKU</b> for the real bill.</span>
                  </div>
                  <div className="how-bullet-item">
                    <span className="how-bullet-dot" />
                    <span>With the current usage the real map bill is about $0 – $5 per month, so the calculator's estimate is higher on purpose.</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =================================================================
            CATEGORY 4: LICENSING, MARKUP & MARGINS
            ================================================================= */}
        {(activeTab === 'all' || activeTab === 'fees') && (
          <div className="how-category-group">
            <div className="how-category-header">
              <span className="how-category-tag">Stage 4</span>
              <h2>Licensing, Markup &amp; Profit Margins</h2>
            </div>

            {/* Step 7 */}
            <section className="card how-card">
              <div className="how-card-head">
                <span className="how-num">7</span>
                <div>
                  <h3>Infrastructure cost (monthly)</h3>
                  <p className="how-card-sub">Sum of all underlying hosting and third-party APIs.</p>
                </div>
              </div>
              <p className="how-body-text">
                Sum of <b>Server + Backups + DB + Storage + Map</b>, converted at <b>$1 = ₹{r.usdToInr}</b>. Each line can be switched off in the calculator.
              </p>
            </section>

            {/* Step 8 */}
            <section className="card how-card">
              <div className="how-card-head">
                <span className="how-num">8</span>
                <div>
                  <h3>Markup (one-time)</h3>
                  <p className="how-card-sub">Commercial margin applied on server infrastructure setup.</p>
                </div>
              </div>
              <div className="how-formula-banner">
                <code>markup = infrastructure cost × {r.markupPct}%</code>
              </div>
            </section>

            {/* Step 9 */}
            <section className="card how-card">
              <div className="how-card-head">
                <span className="how-num">9</span>
                <div>
                  <h3>User / branch / client / module fees (one-time)</h3>
                  <p className="how-card-sub">Scale licensing fees and core capability modules.</p>
                </div>
              </div>
              <div className="how-formula-banner">
                <code>users × {money(r.perUser)} + branches × {money(r.perBranch)} + clients × {money(r.perClient)}</code>
              </div>
              <div className="how-module-fees-grid">
                <div className="how-module-fee-card">
                  <span className="how-mod-title">Backup Module</span>
                  <span className="how-mod-val">{money(r.moduleFee.backup)}</span>
                  <small>Added only if backup is on</small>
                </div>
                <div className="how-module-fee-card">
                  <span className="how-mod-title">Live Tracking Module</span>
                  <span className="how-mod-val">{money(r.moduleFee.tracking)}</span>
                  <small>Added only if tracking is on</small>
                </div>
                <div className="how-module-fee-card">
                  <span className="how-mod-title">MFI Core Module</span>
                  <span className="how-mod-val">{money(r.moduleFee.mfi)}</span>
                  <small>Added only if MFI is on</small>
                </div>
              </div>
            </section>

            {/* Step 10 */}
            <section className="card how-card">
              <div className="how-card-head">
                <span className="how-num">10</span>
                <div>
                  <h3>GST (Goods &amp; Services Tax)</h3>
                  <p className="how-card-sub">Statutory government tax calculation.</p>
                </div>
              </div>
              <div className="how-formula-banner">
                <code>GST = {r.gstPct ?? 18}% on monthly, yearly and one-time payments</code>
              </div>
              <p className="how-body-text">
                Monthly payable = <b>monthly + GST</b>.
                <br />
                One-time payable = <b>(markup + fees + setup) + GST</b>.
                <br />
                <span className="how-note-text">GST is collected for the government, so it is <b>not</b> part of your margin.</span>
              </p>
            </section>

            {/* Step 11 */}
            <section className="card how-card how-margin-card">
              <div className="how-card-head">
                <span className="how-num how-num-green">11</span>
                <div>
                  <h3 className="how-margin-title">Your Margin (Net Profit)</h3>
                  <p className="how-card-sub">Total gross revenue earned from this client deployment.</p>
                </div>
              </div>
              <div className="how-formula-banner how-formula-green">
                <code>margin = markup + fees</code>
              </div>
              <p className="how-body-text">
                This is your profit, collected once upon onboarding. The monthly price charged is server cost only.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
