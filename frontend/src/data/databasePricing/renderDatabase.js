// Render PostgreSQL Pricing | Currency: USD
// Last verified: 2024-01 | Estimates only — verify at render.com/pricing
export const renderDatabase = {
  id: 'render',
  name: 'Render',
  color: '#46E3B7',
  bgColor: '#E5FDF7',
  currency: 'USD',
  region: 'Global',
  lastVerified: '2024-01',
  note: 'Estimates only. Verify at render.com/pricing',
  services: [
    {
      id: 'render-postgres',
      name: 'Render PostgreSQL',
      billingModel: 'instance',
      haMultiplier: 1,
      plans: [
        { name: 'Free (90d)',     cpu: 0.1, ram: 0.25, storage: 1,   connections: 25,  iops: 0, pricePerMonth: 0,   storagePerGB: 0.30, backupPerGB: 0.10, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0, haCost: 0  },
        { name: 'Starter',        cpu: 1,   ram: 1,    storage: 10,  connections: 25,  iops: 0, pricePerMonth: 7,   storagePerGB: 0.30, backupPerGB: 0.10, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0, haCost: 7  },
        { name: 'Standard',       cpu: 1,   ram: 4,    storage: 50,  connections: 100, iops: 0, pricePerMonth: 20,  storagePerGB: 0.30, backupPerGB: 0.10, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0, haCost: 20 },
        { name: 'Pro',            cpu: 2,   ram: 8,    storage: 100, connections: 300, iops: 0, pricePerMonth: 50,  storagePerGB: 0.30, backupPerGB: 0.10, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0, haCost: 50 },
        { name: 'Pro Plus',       cpu: 4,   ram: 16,   storage: 256, connections: 500, iops: 0, pricePerMonth: 130, storagePerGB: 0.30, backupPerGB: 0.10, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0, haCost: 130},
      ],
    },
  ],
};
