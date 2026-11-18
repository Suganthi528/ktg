import { useEffect, useState } from 'react';
import App from './App.jsx';
import CustomerView from './CustomerView.jsx';
import HowItWorks from './HowItWorks.jsx';
import Capacity from './Capacity.jsx';

const routeOf = () => {
  const h = window.location.hash;
  return h === '#/how'
    ? 'how'
    : h === '#/capacity'
    ? 'capacity'
    : h === '#/customer'
    ? 'customer'
    : 'calc';
};

export default function Shell() {
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
      </nav>
      {route === 'how' ? (
        <HowItWorks />
      ) : route === 'capacity' ? (
        <Capacity />
      ) : route === 'customer' ? (
        <CustomerView />
      ) : (
        <App />
      )}
    </>
  );
}