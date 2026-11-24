// DigitalOcean Managed Database Pricing — Region: NYC3 | Currency: USD
// Last verified: 2024-01 | Estimates only — verify at digitalocean.com/pricing
export const digitalOceanDatabase = {
  id: 'digitalocean',
  name: 'DigitalOcean',
  color: '#0080FF',
  bgColor: '#E5F2FF',
  currency: 'USD',
  region: 'NYC3',
  lastVerified: '2024-01',
  note: 'Estimates only. Verify at digitalocean.com/pricing',
  services: [
    {
      id: 'do-managed-db',
      name: 'DigitalOcean Managed DB',
      billingModel: 'instance',
      haMultiplier: 2,
      plans: [
        { name: 'DB 1GB',  cpu: 1,  ram: 1,  storage: 10,  connections: 25,   iops: 0, pricePerMonth: 15,  storagePerGB: 0.10, backupPerGB: 0.023, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.01, haCost: 15  },
        { name: 'DB 2GB',  cpu: 1,  ram: 2,  storage: 25,  connections: 50,   iops: 0, pricePerMonth: 30,  storagePerGB: 0.10, backupPerGB: 0.023, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.01, haCost: 30  },
        { name: 'DB 4GB',  cpu: 2,  ram: 4,  storage: 38,  connections: 100,  iops: 0, pricePerMonth: 60,  storagePerGB: 0.10, backupPerGB: 0.023, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.01, haCost: 60  },
        { name: 'DB 8GB',  cpu: 2,  ram: 8,  storage: 115, connections: 200,  iops: 0, pricePerMonth: 120, storagePerGB: 0.10, backupPerGB: 0.023, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.01, haCost: 120 },
        { name: 'DB 16GB', cpu: 4,  ram: 16, storage: 270, connections: 400,  iops: 0, pricePerMonth: 240, storagePerGB: 0.10, backupPerGB: 0.023, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.01, haCost: 240 },
        { name: 'DB 32GB', cpu: 8,  ram: 32, storage: 580, connections: 800,  iops: 0, pricePerMonth: 480, storagePerGB: 0.10, backupPerGB: 0.023, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.01, haCost: 480 },
        { name: 'DB 64GB', cpu: 16, ram: 64, storage: 1150,connections: 1600, iops: 0, pricePerMonth: 960, storagePerGB: 0.10, backupPerGB: 0.023, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.01, haCost: 960 },
      ],
    },
  ],
};
