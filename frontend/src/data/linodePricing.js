// Linode / Akamai Pricing Configuration
// Region: us-east | Currency: USD | Last verified: 2024-01
// All prices are estimates. Verify at https://www.linode.com/pricing/

export const linodePricing = {
  id: 'linode',
  name: 'Linode (Akamai)',
  shortName: 'Linode',
  color: '#02B159',
  bgColor: '#E5F9EE',
  region: 'us-east',
  currency: 'USD',
  freeTier: '$100 free credit for 60 days (new accounts)',
  pricingModel: 'Simple flat monthly pricing',
  lastVerified: '2024-01',
  note: 'Prices are estimates. Verify at linode.com/pricing',

  compute: [
    { name: 'Nanode 1GB', cpu: 1, ram: 1, storage: 25, bandwidth: 1000, pricePerMonth: 5, type: 'compute' },
    { name: 'Linode 2GB', cpu: 1, ram: 2, storage: 50, bandwidth: 2000, pricePerMonth: 12, type: 'compute' },
    { name: 'Linode 4GB', cpu: 2, ram: 4, storage: 80, bandwidth: 4000, pricePerMonth: 24, type: 'compute' },
    { name: 'Linode 8GB', cpu: 4, ram: 8, storage: 160, bandwidth: 5000, pricePerMonth: 48, type: 'compute' },
    { name: 'Linode 16GB', cpu: 6, ram: 16, storage: 320, bandwidth: 8000, pricePerMonth: 96, type: 'compute' },
    { name: 'Linode 32GB', cpu: 8, ram: 32, storage: 640, bandwidth: 12000, pricePerMonth: 192, type: 'compute' },
    { name: 'Linode 64GB', cpu: 16, ram: 64, storage: 1280, bandwidth: 16000, pricePerMonth: 384, type: 'compute' },
    { name: 'Linode 96GB', cpu: 20, ram: 96, storage: 1920, bandwidth: 20000, pricePerMonth: 576, type: 'compute' },
    { name: 'Linode 128GB', cpu: 24, ram: 128, storage: 2560, bandwidth: 25000, pricePerMonth: 768, type: 'compute' },
  ],

  database: [
    { name: 'DB 1GB', cpu: 1, ram: 1, storage: 15, pricePerMonth: 15, overagePerGB: 0.10, type: 'database' },
    { name: 'DB 2GB', cpu: 2, ram: 2, storage: 40, pricePerMonth: 30, overagePerGB: 0.10, type: 'database' },
    { name: 'DB 4GB', cpu: 2, ram: 4, storage: 75, pricePerMonth: 60, overagePerGB: 0.10, type: 'database' },
    { name: 'DB 8GB', cpu: 4, ram: 8, storage: 165, pricePerMonth: 120, overagePerGB: 0.10, type: 'database' },
    { name: 'DB 16GB', cpu: 6, ram: 16, storage: 325, pricePerMonth: 240, overagePerGB: 0.10, type: 'database' },
    { name: 'DB 32GB', cpu: 8, ram: 32, storage: 650, pricePerMonth: 480, overagePerGB: 0.10, type: 'database' },
    { name: 'DB 64GB', cpu: 16, ram: 64, storage: 1300, pricePerMonth: 960, overagePerGB: 0.10, type: 'database' },
  ],

  storage: [
    { name: 'Object Storage (250GB)', pricePerMonth: 5, included: 250, overagePerGB: 0.02, type: 'storage', billingUnit: 'GB/month' },
    { name: 'Block Storage', pricePerGB: 0.10, included: 0, type: 'disk' },
  ],

  network: [
    { name: 'NodeBalancer', pricePerMonth: 10, type: 'network' },
    { name: 'Bandwidth Overage', pricePerGB: 0.01, type: 'egress' },
  ],

  backup: [
    { name: 'Linode Backups (25% of plan price)', pct: 25, type: 'backup' },
  ],

  plans: [
    { name: 'Nanode 1GB', cpu: 1, ram: 1, pricePerMonth: 5, cap: 40 },
    { name: 'Linode 2GB', cpu: 1, ram: 2, pricePerMonth: 12, cap: 120 },
    { name: 'Linode 4GB', cpu: 2, ram: 4, pricePerMonth: 24, cap: 300 },
    { name: 'Linode 8GB', cpu: 4, ram: 8, pricePerMonth: 48, cap: 700 },
    { name: 'Linode 16GB', cpu: 6, ram: 16, pricePerMonth: 96, cap: 1600 },
    { name: 'Linode 32GB', cpu: 8, ram: 32, pricePerMonth: 192, cap: 3500 },
    { name: 'Linode 64GB', cpu: 16, ram: 64, pricePerMonth: 384, cap: 8000 },
    { name: 'Linode 96GB', cpu: 20, ram: 96, pricePerMonth: 576, cap: 16000 },
    { name: 'Linode 128GB', cpu: 24, ram: 128, pricePerMonth: 768, cap: 32000 },
  ],
  dbPlans: [
    { name: 'DB 1GB', cpu: 1, ram: 1, pricePerMonth: 15, cap: 150 },
    { name: 'DB 2GB', cpu: 2, ram: 2, pricePerMonth: 30, cap: 500 },
    { name: 'DB 4GB', cpu: 2, ram: 4, pricePerMonth: 60, cap: 1500 },
    { name: 'DB 8GB', cpu: 4, ram: 8, pricePerMonth: 120, cap: 4000 },
    { name: 'DB 16GB', cpu: 6, ram: 16, pricePerMonth: 240, cap: 10000 },
    { name: 'DB 32GB', cpu: 8, ram: 32, pricePerMonth: 480, cap: 25000 },
    { name: 'DB 64GB', cpu: 16, ram: 64, pricePerMonth: 960, cap: 60000 },
  ],
  storageBase: 0.02,
  storageFree: 250,
  storageBasePrice: 5,
  bandwidthBase: 0.01,
  bandwidthFree: 1000,
};
