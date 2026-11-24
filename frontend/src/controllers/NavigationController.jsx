import { useEffect, useState } from 'react';
import { FileText, Calculator, Cloud, BookOpen, Users, BarChart3 } from 'lucide-react';
import logo from '../assets/ktg-logo.png';
import CalculatorView from '../views/CalculatorView.jsx';
import CustomerView from '../views/CustomerView.jsx';
import CustomerPageView from '../views/CustomerPageView.jsx';
import HowItWorksView from '../views/HowItWorksView.jsx';
import MarketAnalysisView from '../views/MarketAnalysisView.jsx';
import MultiCloudView from '../views/MultiCloudView.jsx';

const ROUTES = {
  '#/calculator': 'calc',
  '#/how': 'how',
  '#/customer': 'customer',
  '#/market': 'market',
  '#/multicloud': 'multicloud',
};

// Home page ("#/" or empty) = Customer quotation
const routeOf = () => ROUTES[window.location.hash] || 'customer-page';

const NAV = [
  { route: 'customer-page', href: '#/',           label: 'Quotation',          Icon: FileText },
  { route: 'calc',          href: '#/calculator', label: 'Calculator',         Icon: Calculator },
  { route: 'multicloud',    href: '#/multicloud', label: 'Capacity',           Icon: Cloud },
  { route: 'how',           href: '#/how',        label: "How it's calculated", Icon: BookOpen },
  { route: 'customer',      href: '#/customer',   label: 'Customer View',      Icon: Users },
  { route: 'market',        href: '#/market',     label: 'Market Analysis',    Icon: BarChart3 },
];

export default function NavigationController() {
  const [route, setRoute] = useState(routeOf);

  useEffect(() => {
    const on = () => setRoute(routeOf());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  // Mobile: copy each table header text onto its cells so stacked rows keep their labels
  useEffect(() => {
    const label = () => {
      document.querySelectorAll('table.how-table').forEach((t) => {
        const heads = [...t.querySelectorAll('thead th')].map((th) => th.textContent.trim());
        if (!heads.length) return;
        t.querySelectorAll('tbody tr').forEach((tr) => {
          let i = 0;
          [...tr.children].forEach((td) => {
            if (heads[i] && td.getAttribute('data-label') !== heads[i]) td.setAttribute('data-label', heads[i]);
            i += td.colSpan || 1;
          });
        });
      });
    };
    label();
    const mo = new MutationObserver(label);
    mo.observe(document.getElementById('root'), { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, []);

  return (
    <>
      <nav className="top-nav" aria-label="Main">
        <a href="#/" className="nav-brand" aria-label="Knock The Globe Technologies">
          <img src={logo} alt="Knock The Globe Technologies" />
        </a>
        <span className="nav-spacer" />
        {NAV.map(({ route: r, href, label, Icon }) => (
          <a key={r} href={href} className={route === r ? 'active' : ''} aria-current={route === r ? 'page' : undefined}>
            <Icon size={15} strokeWidth={2} />
            <span>{label}</span>
          </a>
        ))}
      </nav>
      {route === 'market' ? (
        <MarketAnalysisView />
      ) : route === 'how' ? (
        <HowItWorksView />
      ) : route === 'multicloud' ? (
        <MultiCloudView />
      ) : route === 'customer' ? (
        <CustomerView />
      ) : route === 'customer-page' ? (
        <CustomerPageView />
      ) : (
        <CalculatorView />
      )}
    </>
  );
}
