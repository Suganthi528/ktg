// Azure Database Pricing — Region: East US | Currency: USD
// Last verified: 2024-01 | Estimates only — verify at azure.microsoft.com/pricing
export const azureDatabase = {
  id: 'azure',
  name: 'Microsoft Azure',
  color: '#0078D4',
  bgColor: '#E6F2FF',
  currency: 'USD',
  region: 'East US',
  lastVerified: '2024-01',
  note: 'Estimates only. Verify at azure.microsoft.com/pricing',
  services: [
    {
      id: 'azure-sql',
      name: 'Azure SQL Database',
      billingModel: 'instance',
      haMultiplier: 2,
      plans: [
        { name: 'Basic (5 DTU)',      cpu: 1,  ram: 1,   storage: 2,   connections: 30,   iops: 0,  pricePerMonth: 4.99,   storagePerGB: 0.125, backupPerGB: 0.05, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.087, haCost: 4.99   },
        { name: 'S0 (10 DTU)',        cpu: 1,  ram: 2,   storage: 250, connections: 60,   iops: 0,  pricePerMonth: 15.00,  storagePerGB: 0.125, backupPerGB: 0.05, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.087, haCost: 15.00  },
        { name: 'S1 (20 DTU)',        cpu: 2,  ram: 4,   storage: 250, connections: 90,   iops: 0,  pricePerMonth: 30.00,  storagePerGB: 0.125, backupPerGB: 0.05, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.087, haCost: 30.00  },
        { name: 'S2 (50 DTU)',        cpu: 2,  ram: 8,   storage: 250, connections: 120,  iops: 0,  pricePerMonth: 75.00,  storagePerGB: 0.125, backupPerGB: 0.05, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.087, haCost: 75.00  },
        { name: 'GP 2vCores',         cpu: 2,  ram: 10,  storage: 32,  connections: 180,  iops: 0,  pricePerMonth: 185.00, storagePerGB: 0.115, backupPerGB: 0.05, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.087, haCost: 185.00 },
        { name: 'GP 4vCores',         cpu: 4,  ram: 20,  storage: 100, connections: 360,  iops: 0,  pricePerMonth: 370.00, storagePerGB: 0.115, backupPerGB: 0.05, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.087, haCost: 370.00 },
      ],
    },
    {
      id: 'cosmos-db',
      name: 'Azure Cosmos DB',
      billingModel: 'serverless',
      haMultiplier: 1,
      plans: [
        { name: 'Serverless',         cpu: 0,  ram: 0,   storage: 25,  connections: 999999, iops: 0, pricePerMonth: 0,      storagePerGB: 0.25,  backupPerGB: 0.10, iopsPerUnit: 0, readPerMillion: 0.28, writePerMillion: 1.40, networkPerGB: 0.08, haCost: 0 },
        { name: 'Provisioned 400 RU', cpu: 0,  ram: 0,   storage: 25,  connections: 999999, iops: 0, pricePerMonth: 23.36,  storagePerGB: 0.25,  backupPerGB: 0.10, iopsPerUnit: 0, readPerMillion: 0,    writePerMillion: 0,    networkPerGB: 0.08, haCost: 23.36 },
        { name: 'Provisioned 1000 RU',cpu: 0,  ram: 0,   storage: 100, connections: 999999, iops: 0, pricePerMonth: 58.40,  storagePerGB: 0.25,  backupPerGB: 0.10, iopsPerUnit: 0, readPerMillion: 0,    writePerMillion: 0,    networkPerGB: 0.08, haCost: 58.40 },
      ],
    },
  ],
};
