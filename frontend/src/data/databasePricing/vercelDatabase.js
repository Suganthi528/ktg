// Vercel Database Integrations | Currency: USD
// Last verified: 2024-01 | Estimates only — verify at vercel.com/docs/storage
export const vercelDatabase = {
  id: 'vercel',
  name: 'Vercel',
  color: '#000000',
  bgColor: '#F0F0F0',
  currency: 'USD',
  region: 'Global (Edge)',
  lastVerified: '2024-01',
  note: 'Estimates only. Vercel uses partner DBs (Neon, Upstash). Verify at vercel.com/docs/storage',
  services: [
    {
      id: 'vercel-postgres',
      name: 'Vercel Postgres (Neon)',
      billingModel: 'serverless',
      haMultiplier: 1,
      plans: [
        { name: 'Hobby (Free)', cpu: 0, ram: 0, storage: 0.5, connections: 100,  iops: 0, pricePerMonth: 0,  storagePerGB: 0.30, backupPerGB: 0, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0, haCost: 0 },
        { name: 'Pro',          cpu: 0, ram: 0, storage: 10,  connections: 1000, iops: 0, pricePerMonth: 20, storagePerGB: 0.30, backupPerGB: 0, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0, haCost: 0 },
      ],
    },
    {
      id: 'vercel-kv',
      name: 'Vercel KV (Upstash Redis)',
      billingModel: 'serverless',
      haMultiplier: 1,
      plans: [
        { name: 'Free',  cpu: 0, ram: 0, storage: 0.025, connections: 999999, iops: 0, pricePerMonth: 0,  storagePerGB: 0, backupPerGB: 0, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0, haCost: 0 },
        { name: 'Pro',   cpu: 0, ram: 0, storage: 10,    connections: 999999, iops: 0, pricePerMonth: 10, storagePerGB: 0.25, backupPerGB: 0, iopsPerUnit: 0, readPerMillion: 0.65, writePerMillion: 0.65, networkPerGB: 0, haCost: 0 },
      ],
    },
  ],
};
