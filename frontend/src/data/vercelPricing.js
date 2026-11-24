// Vercel Pricing Configuration
// Currency: USD | Last verified: 2024-01
// All prices are estimates. Verify at https://vercel.com/pricing

export const vercelPricing = {
  id: 'vercel',
  name: 'Vercel',
  shortName: 'Vercel',
  color: '#000000',
  bgColor: '#F0F0F0',
  currency: 'USD',
  freeTier: 'Hobby: Free for personal projects. 100GB bandwidth/mo',
  pricingModel: 'Tier-based with usage overages',
  lastVerified: '2024-01',
  note: 'Primarily for frontend/JAMstack. Backend via serverless functions. Verify at vercel.com/pricing',

  plans: [
    { name: 'Hobby (Free)', pricePerMonth: 0, note: 'Personal projects only', cap: 40, cpu: 0.5, ram: 0.5 },
    { name: 'Pro ($20/mo)', pricePerMonth: 20, note: 'Teams + more resources', cap: 300, cpu: 1, ram: 1 },
    { name: 'Enterprise', pricePerMonth: 400, note: 'Custom SLA & SSO', cap: 1600, cpu: 4, ram: 8 },
  ],

  dbPlans: [
    { name: 'Vercel KV (Upstash)', cpu: 1, ram: 1, pricePerMonth: 0, cap: 500, note: '30K req/day free' },
    { name: 'Vercel Postgres (Neon)', cpu: 1, ram: 1, pricePerMonth: 0, cap: 2000, note: '0.5GB storage free' },
  ],

  features: {
    deployments: { free: 'Unlimited', pro: 'Unlimited' },
    bandwidth: { free: '100GB/mo', pro: '1TB/mo', overagePerGB: 0.15 },
    functions: {
      free: { invocations: '100K/day', duration: '10s max' },
      pro: { invocations: '1M/day', duration: '60s max', overagePerMillion: 0.60 },
    },
    imageOptimization: { free: '1000/mo', pro: '5000/mo', overagePer1000: 5 },
    edgeRequests: { free: '1M/mo', pro: '10M/mo', overagePerMillion: 0.65 },
    blobStorage: { free: '500MB', pro: '5GB', overagePerGB: 0.02 },
    dataCache: { free: '5M reads', pro: '10M reads', overagePerMillion: 0.65 },
  },

  storageBase: 0.02,
  storageFree: 0.5,
  bandwidthBase: 0.15,
  bandwidthFree: 100,
};
