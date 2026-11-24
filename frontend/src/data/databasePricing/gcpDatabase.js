// GCP Database Pricing — Region: us-central1 | Currency: USD
// Last verified: 2024-01 | Estimates only — verify at cloud.google.com/sql/pricing
export const gcpDatabase = {
  id: 'gcp',
  name: 'Google Cloud Platform',
  color: '#4285F4',
  bgColor: '#E8F0FE',
  currency: 'USD',
  region: 'us-central1',
  lastVerified: '2024-01',
  note: 'Estimates only. Verify at cloud.google.com/sql/pricing',
  services: [
    {
      id: 'cloud-sql',
      name: 'GCP Cloud SQL',
      billingModel: 'instance',
      haMultiplier: 2,
      plans: [
        { name: 'db-f1-micro',          cpu: 1, ram: 0.6,  storage: 10,  connections: 25,   iops: 0, pricePerMonth: 7.67,   storagePerGB: 0.17, backupPerGB: 0.08, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.085, haCost: 7.67   },
        { name: 'db-g1-small',          cpu: 1, ram: 1.7,  storage: 10,  connections: 1000, iops: 0, pricePerMonth: 25.46,  storagePerGB: 0.17, backupPerGB: 0.08, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.085, haCost: 25.46  },
        { name: 'db-n1-standard-1',     cpu: 1, ram: 3.75, storage: 10,  connections: 4000, iops: 0, pricePerMonth: 46.47,  storagePerGB: 0.17, backupPerGB: 0.08, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.085, haCost: 46.47  },
        { name: 'db-n1-standard-2',     cpu: 2, ram: 7.5,  storage: 20,  connections: 4000, iops: 0, pricePerMonth: 92.94,  storagePerGB: 0.17, backupPerGB: 0.08, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.085, haCost: 92.94  },
        { name: 'db-n1-standard-4',     cpu: 4, ram: 15,   storage: 50,  connections: 4000, iops: 0, pricePerMonth: 185.88, storagePerGB: 0.17, backupPerGB: 0.08, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.085, haCost: 185.88 },
        { name: 'db-n1-standard-8',     cpu: 8, ram: 30,   storage: 100, connections: 4000, iops: 0, pricePerMonth: 371.75, storagePerGB: 0.17, backupPerGB: 0.08, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.085, haCost: 371.75 },
      ],
    },
    {
      id: 'firestore',
      name: 'GCP Firestore',
      billingModel: 'serverless',
      haMultiplier: 1,
      plans: [
        { name: 'Spark (Free)',   cpu: 0, ram: 0, storage: 1,    connections: 100,   iops: 0, pricePerMonth: 0,     storagePerGB: 0.18, backupPerGB: 0.10, iopsPerUnit: 0, readPerMillion: 0.06, writePerMillion: 0.18, networkPerGB: 0.12, haCost: 0 },
        { name: 'Blaze (Pay-as-you-go)', cpu: 0, ram: 0, storage: 999999, connections: 999999, iops: 0, pricePerMonth: 0, storagePerGB: 0.18, backupPerGB: 0.10, iopsPerUnit: 0, readPerMillion: 0.06, writePerMillion: 0.18, networkPerGB: 0.12, haCost: 0 },
      ],
    },
    {
      id: 'spanner',
      name: 'GCP Spanner',
      billingModel: 'node',
      haMultiplier: 1,
      plans: [
        { name: '1 Node',  cpu: 1, ram: 0, storage: 0, connections: 999999, iops: 0, pricePerMonth: 657.00, storagePerGB: 0.30, backupPerGB: 0.20, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.12, haCost: 0 },
        { name: '3 Nodes', cpu: 3, ram: 0, storage: 0, connections: 999999, iops: 0, pricePerMonth: 1971.00, storagePerGB: 0.30, backupPerGB: 0.20, iopsPerUnit: 0, readPerMillion: 0, writePerMillion: 0, networkPerGB: 0.12, haCost: 0 },
      ],
    },
  ],
};
