// Linode Managed Database Pricing — Region: us-east | Currency: USD
// Last verified: 2024-01 | Estimates only — verify at linode.com/pricing
export const linodeDatabase = {
  id: 'linode',
  name: 'Linode (Akamai)',
  color: '#02B159',
  bgColor: '#E5F9EE',
  currency: 'USD',
  region: 'us-east',
  lastVerified: '2024-01',
  note: 'Estimates only. Verify at linode.com/pricing',
  services: [
    {
      id: 'linode-managed-db',
      name: 'Linode Managed Database',
      billingModel: 'instance',
      haMultiplier: 2,
      plans: [
        { name: 'DB 1GB',  cpu: 1,  ram: 1,  storage: 15,  connections: 25,  iops: 0, pricePerMonth: 15,  storagePerGB: 0.10, backupPerGB: 0.02, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.01, haCost: 15  },
        { name: 'DB 2GB',  cpu: 2,  ram: 2,  storage: 40,  connections: 50,  iops: 0, pricePerMonth: 30,  storagePerGB: 0.10, backupPerGB: 0.02, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.01, haCost: 30  },
        { name: 'DB 4GB',  cpu: 2,  ram: 4,  storage: 75,  connections: 100, iops: 0, pricePerMonth: 60,  storagePerGB: 0.10, backupPerGB: 0.02, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.01, haCost: 60  },
        { name: 'DB 8GB',  cpu: 4,  ram: 8,  storage: 165, connections: 200, iops: 0, pricePerMonth: 120, storagePerGB: 0.10, backupPerGB: 0.02, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.01, haCost: 120 },
        { name: 'DB 16GB', cpu: 6,  ram: 16, storage: 325, connections: 400, iops: 0, pricePerMonth: 240, storagePerGB: 0.10, backupPerGB: 0.02, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.01, haCost: 240 },
        { name: 'DB 32GB', cpu: 8,  ram: 32, storage: 650, connections: 800, iops: 0, pricePerMonth: 480, storagePerGB: 0.10, backupPerGB: 0.02, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.01, haCost: 480 },
        { name: 'DB 64GB', cpu: 16, ram: 64, storage: 1300,connections: 1600,iops: 0, pricePerMonth: 960, storagePerGB: 0.10, backupPerGB: 0.02, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.01, haCost: 960 },
      ],
    },
  ],
};
