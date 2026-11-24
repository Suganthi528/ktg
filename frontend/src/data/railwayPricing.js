// Railway Pricing Configuration
// Currency: USD | Last verified: 2024-01
// All prices are estimates. Verify at https://railway.app/pricing

export const railwayPricing = {
  id: 'railway',
  name: 'Railway',
  shortName: 'Railway',
  color: '#B44FEA',
  bgColor: '#F5E8FD',
  currency: 'USD',
  freeTier: 'Hobby: $5/mo free credit. Trial: 500 hours/month',
  pricingModel: 'Resource-based usage billing (CPU + RAM + GB)',
  lastVerified: '2024-01',
  note: 'Prices are estimates. Railway bills per resource usage. Verify at railway.app/pricing',

  plans: [
    { name: 'Trial', pricePerMonth: 0, cpu: 0.5, ram: 0.5, note: '500 hrs free, card needed after', cap: 40 },
    { name: 'Hobby ($5/mo)', pricePerMonth: 5, cpu: 2, ram: 2, note: '$5 credit included', cap: 120 },
    { name: 'Pro - 1vCPU/2GB', pricePerMonth: 20, cpu: 1, ram: 2, cap: 300 },
    { name: 'Pro - 2vCPU/4GB', pricePerMonth: 35, cpu: 2, ram: 4, cap: 700 },
    { name: 'Pro - 4vCPU/8GB', pricePerMonth: 65, cpu: 4, ram: 8, cap: 1600 },
    { name: 'Pro - 8vCPU/16GB', pricePerMonth: 125, cpu: 8, ram: 16, cap: 3500 },
    { name: 'Pro - 16vCPU/32GB', pricePerMonth: 240, cpu: 16, ram: 32, cap: 8000 },
  ],

  dbPlans: [
    { name: 'Railway PostgreSQL S', cpu: 1, ram: 1, pricePerMonth: 7, cap: 500 },
    { name: 'Railway PostgreSQL M', cpu: 2, ram: 4, pricePerMonth: 25, cap: 2000 },
    { name: 'Railway PostgreSQL L', cpu: 4, ram: 8, pricePerMonth: 55, cap: 8000 },
  ],

  usagePricing: {
    cpuPerVCPUHour: 0.000463,
    ramPerGBHour: 0.000231,
    storagePerGBMonth: 0.25,
    networkEgressPerGB: 0.10,
  },

  storage: [
    { name: 'Persistent Volume', pricePerGB: 0.25, type: 'disk' },
  ],

  storageBase: 0.25,
  storageFree: 0,
  bandwidthBase: 0.10,
  bandwidthFree: 0,
};
