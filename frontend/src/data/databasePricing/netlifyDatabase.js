// Netlify Connected Database | Currency: USD
// Last verified: 2024-01 | Estimates only — verify at netlify.com/pricing
export const netlifyDatabase = {
  id: 'netlify',
  name: 'Netlify',
  color: '#00C7B7',
  bgColor: '#E5FDFB',
  currency: 'USD',
  region: 'Global',
  lastVerified: '2024-01',
  note: 'Netlify uses partner databases (PlanetScale, Fauna, Supabase). Estimates only.',
  services: [
    {
      id: 'netlify-db',
      name: 'Netlify DB (via Fauna)',
      billingModel: 'serverless',
      haMultiplier: 1,
      plans: [
        { name: 'Free',       cpu: 0, ram: 0, storage: 5,   connections: 999999, iops: 0, pricePerMonth: 0,  storagePerGB: 0.23, backupPerGB: 0, iopsPerUnit: 0, readPerMillion: 0.045, writePerMillion: 0.225, networkPerGB: 0.12, haCost: 0 },
        { name: 'Individual', cpu: 0, ram: 0, storage: 20,  connections: 999999, iops: 0, pricePerMonth: 25, storagePerGB: 0.23, backupPerGB: 0, iopsPerUnit: 0, readPerMillion: 0.045, writePerMillion: 0.225, networkPerGB: 0.12, haCost: 0 },
        { name: 'Team',       cpu: 0, ram: 0, storage: 100, connections: 999999, iops: 0, pricePerMonth: 99, storagePerGB: 0.23, backupPerGB: 0, iopsPerUnit: 0, readPerMillion: 0.045, writePerMillion: 0.225, networkPerGB: 0.12, haCost: 0 },
      ],
    },
  ],
};
