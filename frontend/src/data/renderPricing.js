// Render Pricing Configuration
// Currency: USD | Last verified: 2024-01
// All prices are estimates. Verify at https://render.com/pricing

export const renderPricing = {
  id: 'render',
  name: 'Render',
  shortName: 'Render',
  color: '#46E3B7',
  bgColor: '#E5FDF7',
  currency: 'USD',
  freeTier: 'Free tier: 750 hours/month for web services, free PostgreSQL (90-day trial)',
  pricingModel: 'Instance-based monthly pricing',
  lastVerified: '2024-01',
  note: 'Prices are estimates. Verify at render.com/pricing',

  compute: [
    { name: 'Free (0.1 CPU/256MB)', cpu: 0.1, ram: 0.25, pricePerMonth: 0, type: 'compute', note: '750 hrs/mo, spins down on inactivity' },
    { name: 'Starter (0.5 CPU/512MB)', cpu: 0.5, ram: 0.5, pricePerMonth: 7, type: 'compute' },
    { name: 'Standard (1 CPU/2GB)', cpu: 1, ram: 2, pricePerMonth: 25, type: 'compute' },
    { name: 'Pro (2 CPU/4GB)', cpu: 2, ram: 4, pricePerMonth: 85, type: 'compute' },
    { name: 'Pro Plus (4 CPU/8GB)', cpu: 4, ram: 8, pricePerMonth: 175, type: 'compute' },
    { name: 'Pro Max (4 CPU/16GB)', cpu: 4, ram: 16, pricePerMonth: 225, type: 'compute' },
    { name: 'Pro Ultra (8 CPU/32GB)', cpu: 8, ram: 32, pricePerMonth: 450, type: 'compute' },
  ],

  database: [
    { name: 'PostgreSQL Free (90d)', cpu: 0.1, ram: 0.25, storage: 1, pricePerMonth: 0, overagePerGB: 0, type: 'database', note: '90-day trial, then expires' },
    { name: 'PostgreSQL Starter', cpu: 1, ram: 1, storage: 10, pricePerMonth: 7, overagePerGB: 0.30, type: 'database' },
    { name: 'PostgreSQL Standard', cpu: 1, ram: 4, storage: 50, pricePerMonth: 20, overagePerGB: 0.30, type: 'database' },
    { name: 'PostgreSQL Pro', cpu: 2, ram: 8, storage: 100, pricePerMonth: 50, overagePerGB: 0.30, type: 'database' },
    { name: 'PostgreSQL Pro Plus', cpu: 4, ram: 16, storage: 256, pricePerMonth: 130, overagePerGB: 0.30, type: 'database' },
  ],

  keyvalue: [
    { name: 'Redis Free', pricePerMonth: 0, storage: 25, note: '25MB limit, free forever', type: 'cache' },
    { name: 'Redis Starter', pricePerMonth: 10, storage: 1024, type: 'cache' },
    { name: 'Redis Standard', pricePerMonth: 30, storage: 5120, type: 'cache' },
  ],

  storage: [
    { name: 'Persistent Disk', pricePerGB: 0.25, included: 0, type: 'disk', billingUnit: 'GB/month' },
    { name: 'Static Site Hosting', pricePerMonth: 0, type: 'static', note: 'Free for static sites' },
  ],

  plans: [
    { name: 'Starter (0.5CPU/512MB)', cpu: 0.5, ram: 0.5, pricePerMonth: 7, cap: 40 },
    { name: 'Standard (1CPU/2GB)', cpu: 1, ram: 2, pricePerMonth: 25, cap: 300 },
    { name: 'Pro (2CPU/4GB)', cpu: 2, ram: 4, pricePerMonth: 85, cap: 700 },
    { name: 'Pro Plus (4CPU/8GB)', cpu: 4, ram: 8, pricePerMonth: 175, cap: 1600 },
    { name: 'Pro Max (4CPU/16GB)', cpu: 4, ram: 16, pricePerMonth: 225, cap: 3500 },
    { name: 'Pro Ultra (8CPU/32GB)', cpu: 8, ram: 32, pricePerMonth: 450, cap: 8000 },
  ],
  dbPlans: [
    { name: 'PostgreSQL Starter', cpu: 1, ram: 1, pricePerMonth: 7, cap: 500 },
    { name: 'PostgreSQL Standard', cpu: 1, ram: 4, pricePerMonth: 20, cap: 1500 },
    { name: 'PostgreSQL Pro', cpu: 2, ram: 8, pricePerMonth: 50, cap: 4000 },
    { name: 'PostgreSQL Pro Plus', cpu: 4, ram: 16, pricePerMonth: 130, cap: 10000 },
  ],
  storageBase: 0.25,
  storageFree: 0,
  bandwidthBase: 0,
  bandwidthFree: 100,
};
