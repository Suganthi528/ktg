// AWS Database Pricing — Region: us-east-1 | Currency: USD
// Last verified: 2024-01 | Estimates only — verify at aws.amazon.com/rds/pricing
export const awsDatabase = {
  id: 'aws',
  name: 'Amazon Web Services',
  color: '#FF9900',
  bgColor: '#FFF8E6',
  currency: 'USD',
  region: 'us-east-1',
  lastVerified: '2024-01',
  note: 'Estimates only. Verify at aws.amazon.com/rds/pricing',
  services: [
    {
      id: 'rds-mysql',
      name: 'AWS RDS (MySQL/PostgreSQL)',
      billingModel: 'instance',
      haMultiplier: 2,
      plans: [
        { name: 'db.t3.micro',    cpu: 2,  ram: 1,   storage: 20,  connections: 60,   iops: 0,    pricePerMonth: 25.92,  storagePerGB: 0.115, backupPerGB: 0.095, iopsPerUnit: 0,    readPerMillion: 0,    writePerMillion: 0,    networkPerGB: 0.09,  haCost: 25.92  },
        { name: 'db.t3.small',    cpu: 2,  ram: 2,   storage: 20,  connections: 150,  iops: 0,    pricePerMonth: 51.84,  storagePerGB: 0.115, backupPerGB: 0.095, iopsPerUnit: 0,    readPerMillion: 0,    writePerMillion: 0,    networkPerGB: 0.09,  haCost: 51.84  },
        { name: 'db.t3.medium',   cpu: 2,  ram: 4,   storage: 20,  connections: 312,  iops: 0,    pricePerMonth: 103.68, storagePerGB: 0.115, backupPerGB: 0.095, iopsPerUnit: 0,    readPerMillion: 0,    writePerMillion: 0,    networkPerGB: 0.09,  haCost: 103.68 },
        { name: 'db.m5.large',    cpu: 2,  ram: 8,   storage: 100, connections: 683,  iops: 0,    pricePerMonth: 185.76, storagePerGB: 0.115, backupPerGB: 0.095, iopsPerUnit: 0,    readPerMillion: 0,    writePerMillion: 0,    networkPerGB: 0.09,  haCost: 185.76 },
        { name: 'db.m5.xlarge',   cpu: 4,  ram: 16,  storage: 200, connections: 1365, iops: 0,    pricePerMonth: 371.52, storagePerGB: 0.115, backupPerGB: 0.095, iopsPerUnit: 0,    readPerMillion: 0,    writePerMillion: 0,    networkPerGB: 0.09,  haCost: 371.52 },
        { name: 'db.m5.2xlarge',  cpu: 8,  ram: 32,  storage: 500, connections: 2730, iops: 0,    pricePerMonth: 743.04, storagePerGB: 0.115, backupPerGB: 0.095, iopsPerUnit: 0,    readPerMillion: 0,    writePerMillion: 0,    networkPerGB: 0.09,  haCost: 743.04 },
      ],
    },
    {
      id: 'aurora-mysql',
      name: 'AWS Aurora (MySQL)',
      billingModel: 'instance',
      haMultiplier: 2,
      plans: [
        { name: 'db.t3.medium',   cpu: 2,  ram: 4,   storage: 10,  connections: 312,  iops: 0,    pricePerMonth: 73.00,  storagePerGB: 0.10,  backupPerGB: 0.021, iopsPerUnit: 0.20, readPerMillion: 0,    writePerMillion: 0,    networkPerGB: 0.08,  haCost: 73.00  },
        { name: 'db.r5.large',    cpu: 2,  ram: 16,  storage: 10,  connections: 1000, iops: 0,    pricePerMonth: 240.00, storagePerGB: 0.10,  backupPerGB: 0.021, iopsPerUnit: 0.20, readPerMillion: 0,    writePerMillion: 0,    networkPerGB: 0.08,  haCost: 240.00 },
        { name: 'db.r5.xlarge',   cpu: 4,  ram: 32,  storage: 10,  connections: 2000, iops: 0,    pricePerMonth: 480.00, storagePerGB: 0.10,  backupPerGB: 0.021, iopsPerUnit: 0.20, readPerMillion: 0,    writePerMillion: 0,    networkPerGB: 0.08,  haCost: 480.00 },
        { name: 'db.r5.2xlarge',  cpu: 8,  ram: 64,  storage: 10,  connections: 4000, iops: 0,    pricePerMonth: 960.00, storagePerGB: 0.10,  backupPerGB: 0.021, iopsPerUnit: 0.20, readPerMillion: 0,    writePerMillion: 0,    networkPerGB: 0.08,  haCost: 960.00 },
      ],
    },
    {
      id: 'dynamodb',
      name: 'AWS DynamoDB',
      billingModel: 'serverless',
      haMultiplier: 1,
      plans: [
        { name: 'On-Demand',      cpu: 0,  ram: 0,   storage: 25,  connections: 999999, iops: 0,  pricePerMonth: 0,      storagePerGB: 0.25,  backupPerGB: 0.10,  iopsPerUnit: 0,    readPerMillion: 0.25, writePerMillion: 1.25, networkPerGB: 0.09,  haCost: 0      },
        { name: 'Provisioned 5/5',cpu: 0,  ram: 0,   storage: 25,  connections: 999999, iops: 0,  pricePerMonth: 2.76,   storagePerGB: 0.25,  backupPerGB: 0.10,  iopsPerUnit: 0,    readPerMillion: 0,    writePerMillion: 0,    networkPerGB: 0.09,  haCost: 0      },
      ],
    },
  ],
};
