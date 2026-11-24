// Azure Pricing Configuration
// Region: East US | Currency: USD | Last verified: 2024-01
// All prices are estimates. Verify at https://azure.microsoft.com/pricing/

export const azurePricing = {
  id: 'azure',
  name: 'Microsoft Azure',
  shortName: 'Azure',
  color: '#0078D4',
  bgColor: '#E6F2FF',
  region: 'East US',
  currency: 'USD',
  freeTier: '12 months free + $200 credit for 30 days',
  pricingModel: 'Pay-as-you-go + Reserved',
  lastVerified: '2024-01',
  note: 'Prices are estimates. Verify at azure.microsoft.com/pricing',

  compute: [
    { name: 'B1s (1vCPU/1GB)', cpu: 1, ram: 1, pricePerMonth: 7.59, type: 'compute' },
    { name: 'B2s (2vCPU/4GB)', cpu: 2, ram: 4, pricePerMonth: 30.37, type: 'compute' },
    { name: 'B4ms (4vCPU/16GB)', cpu: 4, ram: 16, pricePerMonth: 121.47, type: 'compute' },
    { name: 'D2s v3 (2vCPU/8GB)', cpu: 2, ram: 8, pricePerMonth: 69.12, type: 'compute' },
    { name: 'D4s v3 (4vCPU/16GB)', cpu: 4, ram: 16, pricePerMonth: 138.24, type: 'compute' },
    { name: 'D8s v3 (8vCPU/32GB)', cpu: 8, ram: 32, pricePerMonth: 276.48, type: 'compute' },
    { name: 'D16s v3 (16vCPU/64GB)', cpu: 16, ram: 64, pricePerMonth: 552.96, type: 'compute' },
    { name: 'F2s v2 (2vCPU/4GB)', cpu: 2, ram: 4, pricePerMonth: 61.20, type: 'compute' },
    { name: 'F4s v2 (4vCPU/8GB)', cpu: 4, ram: 8, pricePerMonth: 122.40, type: 'compute' },
  ],

  database: [
    { name: 'Azure SQL Basic (5 DTU)', cpu: 1, ram: 1, storage: 2, pricePerMonth: 4.99, overagePerGB: 0.125, type: 'database' },
    { name: 'Azure SQL S0 (10 DTU)', cpu: 1, ram: 2, storage: 250, pricePerMonth: 15.00, overagePerGB: 0.125, type: 'database' },
    { name: 'Azure SQL S1 (20 DTU)', cpu: 2, ram: 4, storage: 250, pricePerMonth: 30.00, overagePerGB: 0.125, type: 'database' },
    { name: 'Azure SQL S2 (50 DTU)', cpu: 2, ram: 8, storage: 250, pricePerMonth: 75.00, overagePerGB: 0.125, type: 'database' },
    { name: 'Azure SQL GP 2vCores', cpu: 2, ram: 10.2, storage: 32, pricePerMonth: 185.00, overagePerGB: 0.115, type: 'database' },
    { name: 'Azure SQL GP 4vCores', cpu: 4, ram: 20.4, storage: 100, pricePerMonth: 370.00, overagePerGB: 0.115, type: 'database' },
  ],

  storage: [
    { name: 'Blob Storage (Hot)', pricePerGB: 0.018, included: 5, type: 'storage', billingUnit: 'GB/month' },
    { name: 'Blob Storage (Cool)', pricePerGB: 0.01, included: 0, type: 'storage', billingUnit: 'GB/month' },
    { name: 'Managed Disks P10 (128GB)', pricePerMonth: 19.71, sizeGB: 128, type: 'disk' },
    { name: 'Managed Disks P20 (512GB)', pricePerMonth: 73.22, sizeGB: 512, type: 'disk' },
    { name: 'Azure Files Standard', pricePerGB: 0.06, included: 0, type: 'storage' },
  ],

  network: [
    { name: 'Application Gateway', pricePerHour: 0.032, pricePerGB: 0.008, type: 'network' },
    { name: 'Azure Load Balancer', pricePerHour: 0.025, type: 'network' },
    { name: 'Azure CDN', pricePerGB: 0.081, included: 0, type: 'cdn' },
    { name: 'Data Transfer Out', pricePerGB: 0.087, included: 100, type: 'egress' },
  ],

  serverless: [
    { name: 'Azure Functions', pricePerMillion: 0.20, includedRequests: 1000000, type: 'serverless' },
    { name: 'API Management', pricePerMonth: 49.00, unit: 'Developer tier', type: 'api' },
  ],

  monitoring: [
    { name: 'Azure Monitor', pricePerGB: 2.76, type: 'monitoring' },
    { name: 'Azure Backup', pricePerGB: 0.03, type: 'backup' },
  ],

  plans: [
    { name: 'B1s (1vCPU/1GB)', cpu: 1, ram: 1, pricePerMonth: 7.59, cap: 40 },
    { name: 'B2s (2vCPU/4GB)', cpu: 2, ram: 4, pricePerMonth: 30.37, cap: 300 },
    { name: 'D2s v3 (2vCPU/8GB)', cpu: 2, ram: 8, pricePerMonth: 69.12, cap: 700 },
    { name: 'B4ms (4vCPU/16GB)', cpu: 4, ram: 16, pricePerMonth: 121.47, cap: 1600 },
    { name: 'D4s v3 (4vCPU/16GB)', cpu: 4, ram: 16, pricePerMonth: 138.24, cap: 3500 },
    { name: 'D8s v3 (8vCPU/32GB)', cpu: 8, ram: 32, pricePerMonth: 276.48, cap: 8000 },
    { name: 'D16s v3 (16vCPU/64GB)', cpu: 16, ram: 64, pricePerMonth: 552.96, cap: 16000 },
  ],
  dbPlans: [
    { name: 'Azure SQL Basic', cpu: 1, ram: 1, pricePerMonth: 4.99, cap: 150 },
    { name: 'Azure SQL S0', cpu: 1, ram: 2, pricePerMonth: 15.00, cap: 500 },
    { name: 'Azure SQL S1', cpu: 2, ram: 4, pricePerMonth: 30.00, cap: 1500 },
    { name: 'Azure SQL S2', cpu: 2, ram: 8, pricePerMonth: 75.00, cap: 4000 },
    { name: 'Azure SQL GP 2vCores', cpu: 2, ram: 10, pricePerMonth: 185.00, cap: 10000 },
    { name: 'Azure SQL GP 4vCores', cpu: 4, ram: 20, pricePerMonth: 370.00, cap: 25000 },
  ],
  storageBase: 0.018,
  storageFree: 5,
  bandwidthBase: 0.087,
  bandwidthFree: 100,
};
