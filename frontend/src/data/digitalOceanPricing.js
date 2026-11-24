// DigitalOcean Pricing Configuration
// Region: NYC3 | Currency: USD | Last verified: 2024-01
// All prices are estimates. Verify at https://www.digitalocean.com/pricing

export const digitalOceanPricing = {
  id: 'digitalocean',
  name: 'DigitalOcean',
  shortName: 'DigitalOcean',
  color: '#0080FF',
  bgColor: '#E5F2FF',
  region: 'NYC3',
  currency: 'USD',
  freeTier: '$200 free credit for 60 days (new accounts)',
  pricingModel: 'Simple flat monthly pricing',
  lastVerified: '2024-01',
  note: 'Prices are estimates. Verify at digitalocean.com/pricing',

  compute: [
    { name: 'Droplet Basic 1GB', cpu: 1, ram: 1, storage: 25, bandwidth: 1000, pricePerMonth: 6, type: 'compute' },
    { name: 'Droplet Basic 2GB', cpu: 1, ram: 2, storage: 50, bandwidth: 2000, pricePerMonth: 12, type: 'compute' },
    { name: 'Droplet Basic 4GB', cpu: 2, ram: 4, storage: 80, bandwidth: 4000, pricePerMonth: 24, type: 'compute' },
    { name: 'Droplet Basic 8GB', cpu: 4, ram: 8, storage: 160, bandwidth: 5000, pricePerMonth: 48, type: 'compute' },
    { name: 'Droplet General 8GB', cpu: 2, ram: 8, storage: 25, bandwidth: 4000, pricePerMonth: 63, type: 'compute' },
    { name: 'Droplet General 16GB', cpu: 4, ram: 16, storage: 50, bandwidth: 5000, pricePerMonth: 126, type: 'compute' },
    { name: 'Droplet General 32GB', cpu: 8, ram: 32, storage: 100, bandwidth: 6000, pricePerMonth: 252, type: 'compute' },
    { name: 'Droplet CPU-Opt 4GB', cpu: 2, ram: 4, storage: 25, bandwidth: 4000, pricePerMonth: 42, type: 'compute' },
  ],

  database: [
    { name: 'DB 1GB (1vCPU)', cpu: 1, ram: 1, storage: 10, pricePerMonth: 15, overagePerGB: 0.10, type: 'database' },
    { name: 'DB 2GB (1vCPU)', cpu: 1, ram: 2, storage: 25, pricePerMonth: 30, overagePerGB: 0.10, type: 'database' },
    { name: 'DB 4GB (2vCPU)', cpu: 2, ram: 4, storage: 38, pricePerMonth: 60, overagePerGB: 0.10, type: 'database' },
    { name: 'DB 8GB (2vCPU)', cpu: 2, ram: 8, storage: 115, pricePerMonth: 120, overagePerGB: 0.10, type: 'database' },
    { name: 'DB 16GB (4vCPU)', cpu: 4, ram: 16, storage: 270, pricePerMonth: 240, overagePerGB: 0.10, type: 'database' },
    { name: 'DB 32GB (8vCPU)', cpu: 8, ram: 32, storage: 580, pricePerMonth: 480, overagePerGB: 0.10, type: 'database' },
    { name: 'DB 64GB (16vCPU)', cpu: 16, ram: 64, storage: 1150, pricePerMonth: 960, overagePerGB: 0.10, type: 'database' },
  ],

  storage: [
    { name: 'Spaces (250GB)', pricePerMonth: 5, included: 250, overagePerGB: 0.02, type: 'storage', billingUnit: 'GB/month' },
    { name: 'Block Storage', pricePerGB: 0.10, included: 0, type: 'disk' },
  ],

  network: [
    { name: 'Load Balancer', pricePerMonth: 12, type: 'network' },
    { name: 'Bandwidth Overage', pricePerGB: 0.01, type: 'egress' },
    { name: 'Kubernetes Cluster', pricePerMonth: 0, note: 'Free cluster management, pay for nodes', type: 'compute' },
  ],

  backup: [
    { name: 'Droplet Backups (20% of Droplet price)', pct: 20, type: 'backup' },
    { name: 'Volume Snapshots', pricePerGB: 0.05, type: 'backup' },
  ],

  plans: [
    { name: 'Droplet Basic 1GB', cpu: 1, ram: 1, pricePerMonth: 6, cap: 40 },
    { name: 'Droplet Basic 2GB', cpu: 1, ram: 2, pricePerMonth: 12, cap: 120 },
    { name: 'Droplet Basic 4GB', cpu: 2, ram: 4, pricePerMonth: 24, cap: 300 },
    { name: 'Droplet Basic 8GB', cpu: 4, ram: 8, pricePerMonth: 48, cap: 700 },
    { name: 'Droplet General 16GB', cpu: 4, ram: 16, pricePerMonth: 126, cap: 1600 },
    { name: 'Droplet General 32GB', cpu: 8, ram: 32, pricePerMonth: 252, cap: 3500 },
  ],
  dbPlans: [
    { name: 'DB 1GB', cpu: 1, ram: 1, pricePerMonth: 15, cap: 150 },
    { name: 'DB 2GB', cpu: 1, ram: 2, pricePerMonth: 30, cap: 500 },
    { name: 'DB 4GB', cpu: 2, ram: 4, pricePerMonth: 60, cap: 1500 },
    { name: 'DB 8GB', cpu: 2, ram: 8, pricePerMonth: 120, cap: 4000 },
    { name: 'DB 16GB', cpu: 4, ram: 16, pricePerMonth: 240, cap: 10000 },
    { name: 'DB 32GB', cpu: 8, ram: 32, pricePerMonth: 480, cap: 25000 },
    { name: 'DB 64GB', cpu: 16, ram: 64, pricePerMonth: 960, cap: 60000 },
  ],
  storageBase: 0.02,
  storageFree: 250,
  storageBasePrice: 5,
  bandwidthBase: 0.01,
  bandwidthFree: 1000,
};
