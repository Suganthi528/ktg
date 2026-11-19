import { useEffect, useState } from 'react';
import CalculatorView from '../views/CalculatorView.jsx';
import CustomerView from '../views/CustomerView.jsx';
import CustomerPageView from '../views/CustomerPageView.jsx';
import HowItWorksView from '../views/HowItWorksView.jsx';
import CapacityView from '../views/CapacityView.jsx';

const routeOf = () => {
  const h = window.location.hash;
  return h === '#/how'
    ? 'how'
    : h === '#/capacity'
    ? 'capacity'
    : h === '#/customer'
    ? 'customer'
    : h === '#/customer-page'
    ? 'customer-page'
    : 'calc';
};

export default function NavigationController() {
  const [route, setRoute] = useState(routeOf);

  useEffect(() => {
    const on = () => setRoute(routeOf());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  return (
    <>
      <nav className="top-nav">
        <a href="#/" className={route === 'calc' ? 'active' : ''}>Calculator</a>
        <a href="#/capacity" className={route === 'capacity' ? 'active' : ''}>Capacity</a>
        <a href="#/how" className={route === 'how' ? 'active' : ''}>How it's calculated</a>
        <a href="#/customer" className={route === 'customer' ? 'active' : ''}>Customer View</a>
        <a href="#/customer-page" className={route === 'customer-page' ? 'active' : ''}>Customer</a>
      </nav>
      {route === 'how' ? (
        <HowItWorksView />
      ) : route === 'capacity' ? (
        <CapacityView />
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
