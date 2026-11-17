import { DEFAULT_RATES } from './pricing.js';

const getRates = () => {
  try {
    return { ...DEFAULT_RATES, ...JSON.parse(localStorage.getItem('sp_rates')) };
  } catch {
    return DEFAULT_RATES;
  }
};

const Step = ({ n, title, children }) => (
  <section className="card how-card">
    <h3><span className="how-num">{n}</span>{title}</h3>
    {children}
  </section>
);

export default function HowItWorks() {
  const r = getRates();
  const money = (n) => '₹' + Number(n).toLocaleString('en-IN');
  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-text">
          <h1>How the price is calculated</h1>
          <p>Values shown are your current rates (edit them in the calculator → "Edit rates").</p>
        </div>
      </header>

      <div className="how-grid">
        <Step n="1" title="Summary of what the client pays">
          <ul>
            <li><b>Monthly</b> = Server infrastructure cost only.</li>
            <li><b>Yearly</b> = Monthly × 12, minus {r.yearDiscountPct}% discount.</li>
            <li><b>One-time payment</b> = Markup + User/Branch/Client/Module fees + Setup fee ({money(r.setupFee)}).</li>
            <li><b>GST {r.gstPct ?? 18}%</b> is added on top of all of the above.</li>
          </ul>
        </Step>

        <Step n="2" title="Load → picks the server size">
          <p>A load score decides which Linode plan is needed:</p>
          <code>load = users + clients ÷ 50 + branches × 2 + trackedUsers × 3 + (MFI on ? users × 0.5 : 0)</code>
          <p>The smallest plan whose capacity ≥ load is chosen:</p>
          <table className="how-table"><tbody>
            {r.plans.map((p) => (
              <tr key={p.name}><td>{p.name}</td><td>capacity {p.cap}</td><td>${p.usd}/mo</td></tr>
            ))}
          </tbody></table>
        </Step>

        <Step n="3" title="Database (DigitalOcean)">
          <code>dbLoad = clients ÷ 10 + users × 2 + trackedUsers × 20</code>
          <table className="how-table"><tbody>
            {r.dbPlans.map((p) => (
              <tr key={p.name}><td>{p.name}</td><td>capacity {p.cap}</td><td>${p.usd}/mo</td></tr>
            ))}
          </tbody></table>
        </Step>

        <Step n="4" title="Linode backups">
          <p>Only if Backup is on: <code>plan price × {r.linodeBackupPct}%</code></p>
        </Step>

        <Step n="5" title="Cloud storage (Spaces)">
          <code>data GB = clients × {r.mbPerClient} MB ÷ 1024 + trackedUsers × 0.3</code>
          <p>With Backup on, storage = data × 3 (3 retained copies).</p>
          <code>cost = ${r.spacesUsdPer250GB} for first 250 GB + ${r.spacesExtraUsdPerGB}/GB beyond</code>
        </Step>

        <Step n="6" title="Map charge (live tracking)">
          <p><b>How the calculator estimates it:</b></p>
          <code>loads = trackedUsers × {r.mapLoadsPerUserPerDay} per day × {r.workDaysPerMonth} days</code>
          <code>cost = loads ÷ 1000 × ${r.mapUsdPer1000}</code>
          <p>
            Example: 5 tracked users → 5 × {r.mapLoadsPerUserPerDay} × {r.workDaysPerMonth} = {(5 * r.mapLoadsPerUserPerDay * r.workDaysPerMonth).toLocaleString()} loads
            → ${((5 * r.mapLoadsPerUserPerDay * r.workDaysPerMonth) / 1000 * r.mapUsdPer1000).toFixed(2)} (about {money(Math.round((5 * r.mapLoadsPerUserPerDay * r.workDaysPerMonth) / 1000 * r.mapUsdPer1000 * r.usdToInr))}).
            This is a safe flat estimate and does not subtract Google's free allowance.
          </p>
          <p><b>How Google actually charges (real usage from the Google Cloud project):</b></p>
          <table className="how-table"><thead>
            <tr><th>Google service</th><th>Used for</th><th>Last 30 days</th><th>Nov 1 – 17</th><th>Free / month</th><th>Price after free</th></tr>
          </thead><tbody>
            <tr><td>Maps SDK for Android</td><td>Map in the mobile app</td><td>3,883</td><td>3,015</td><td>Unlimited</td><td>Free</td></tr>
            <tr><td>Maps JavaScript API</td><td>Map on the website</td><td>10,330</td><td>617</td><td>10,000</td><td>≈ $7 / 1000</td></tr>
            <tr><td>Places API</td><td>Search, autocomplete, place details</td><td>6,567</td><td>3,414</td><td>5,000 – 10,000*</td><td>≈ $2.83 – $32 / 1000*</td></tr>
            <tr><td>Roads API</td><td>Snap GPS tracking path to roads</td><td>4,630</td><td>4,630</td><td>5,000 – 10,000*</td><td>≈ $10 / 1000*</td></tr>
            <tr><td>Routes API</td><td>Distance / ETA between points</td><td>178</td><td>67</td><td>10,000</td><td>≈ $5 / 1000</td></tr>
          </tbody></table>
          <ul>
            <li>Only successful calls (2xx) are billed. Error calls (4xx) are not.</li>
            <li>Free allowance resets on the 1st of every month, per service.</li>
            <li>*Depends on the exact SKU used. Prices are approximate from Google's published list; check <b>Cloud Console → Billing → Reports → Group by SKU</b> for the real bill.</li>
            <li>With the current usage the real map bill is about $0 – $5 per month, so the calculator's estimate is higher on purpose.</li>
          </ul>
        </Step>

        <Step n="7" title="Infrastructure cost (monthly)">
          <p>Sum of server + backups + DB + storage + map, converted at $1 = ₹{r.usdToInr}. Each line can be switched off in the calculator.</p>
        </Step>

        <Step n="8" title="Markup (one-time)">
          <code>markup = infrastructure cost × {r.markupPct}%</code>
        </Step>

        <Step n="9" title="User / branch / client / module fees (one-time)">
          <code>users × {money(r.perUser)} + branches × {money(r.perBranch)} + clients × {money(r.perClient)}</code>
          <p>Module fees (added only if the module is on): Backup {money(r.moduleFee.backup)}, Live tracking {money(r.moduleFee.tracking)}, MFI {money(r.moduleFee.mfi)}.</p>
        </Step>

        <Step n="10" title="GST">
          <code>GST = {r.gstPct ?? 18}% on monthly, yearly and one-time payments</code>
          <p>Monthly payable = monthly + GST. One-time payable = (markup + fees + setup) + GST. GST is collected for the government, so it is <b>not</b> part of your margin.</p>
        </Step>

        <Step n="11" title="Your margin">
          <code>margin = markup + fees</code>
          <p>This is your profit, collected once. The monthly price is server cost only.</p>
        </Step>
      </div>
    </div>
  );
}
