// Netlify Pricing Configuration
// Currency: USD | Last verified: 2024-01
// All prices are estimates. Verify at https://www.netlify.com/pricing/

export const netlifyPricing = {
  id: 'netlify',
  name: 'Netlify',
  shortName: 'Netlify',
  color: '#00C7B7',
  bgColor: '#E5FDFB',
  currency: 'USD',
  freeTier: 'Free: 100GB bandwidth, 300 build mins/mo, 125K serverless invocations',
  pricingModel: 'Tier-based with usage overages',
  lastVerified: '2024-01',
  note: 'Primarily for frontend/JAMstack hosting. Verify at netlify.com/pricing',

  plans: [
    { name: 'Free (Starter)', pricePerMonth: 0, note: '1 member, 100GB bandwidth', cap: 40, cpu: 0.5, ram: 0.5 },
    { name: 'Pro ($19/mo)', pricePerMonth: 19, note: '3 members, 400GB bandwidth', cap: 300, cpu: 1, ram: 1 },
    { name: 'Business ($99/mo)', pricePerMonth: 99, note: 'SSO + advanced features', cap: 1600, cpu: 4, ram: 8 },
    { name: 'Enterprise', pricePerMonth: 299, note: 'Custom SLA, priority support', cap: 8000, cpu: 8, ram: 32 },
  ],

  dbPlans: [
    { name: 'Netlify DB (via Fauna)', cpu: 1, ram: 1, pricePerMonth: 0, cap: 500, note: 'Read/write ops based pricing' },
  ],

  features: {
    buildMinutes: { free: '300/mo', pro: '1000/mo', business: '3000/mo', overagePer500: 7 },
    bandwidth: { free: '100GB/mo', pro: '400GB/mo', business: '600GB/mo', overagePerGB: 0.20 },
    functions: {
      free: { invocations: '125K/mo', duration: '10s max' },
      pro: { invocations: '500K/mo', duration: '26s max', overagePerMillion: 25 },
    },
    edgeFunctions: { free: '1M/mo', pro: '3M/mo', overagePerMillion: 2 },
    forms: { free: '100 submissions/mo', pro: '1000 submissions/mo', overagePer1000: 19 },
    storage: { free: '1GB', pro: '5GB', overagePerGB: 0.30 },
  },

  storageBase: 0.30,
  storageFree: 1,
  bandwidthBase: 0.20,
  bandwidthFree: 100,
};
