// Railway PostgreSQL Pricing | Currency: USD
// Last verified: 2024-01 | Estimates only — verify at railway.app/pricing
export const railwayDatabase = {
  id: 'railway',
  name: 'Railway',
  color: '#B44FEA',
  bgColor: '#F5E8FD',
  currency: 'USD',
  region: 'Global',
  lastVerified: '2024-01',
  note: 'Estimates only. Verify at railway.app/pricing',
  services: [
    {
      id: 'railway-postgres',
      name: 'Railway PostgreSQL',
      billingModel: 'instance',
      haMultiplier: 1,
      plans: [
        { name: 'Hobby DB',  cpu: 1, ram: 1, storage: 1,   connections: 20,  iops: 0, pricePerMonth: 5,  storagePerGB: 0.25, backupPerGB: 0, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.10, haCost: 0  },
        { name: 'Pro S',     cpu: 1, ram: 1, storage: 5,   connections: 50,  iops: 0, pricePerMonth: 7,  storagePerGB: 0.25, backupPerGB: 0, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.10, haCost: 0  },
        { name: 'Pro M',     cpu: 2, ram: 4, storage: 20,  connections: 150, iops: 0, pricePerMonth: 25, storagePerGB: 0.25, backupPerGB: 0, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.10, haCost: 0  },
        { name: 'Pro L',     cpu: 4, ram: 8, storage: 50,  connections: 400, iops: 0, pricePerMonth: 55, storagePerGB: 0.25, backupPerGB: 0, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.10, haCost: 0  },
      ],
    },
  ],
};
