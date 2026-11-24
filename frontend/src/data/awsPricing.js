// AWS Pricing Configuration
// Region: us-east-1 | Currency: USD | Last verified: 2024-01
// All prices are estimates. Verify at https://aws.amazon.com/pricing/

export const awsPricing = {
  id: 'aws',
  name: 'Amazon Web Services',
  shortName: 'AWS',
  color: '#FF9900',
  bgColor: '#FFF8E6',
  region: 'us-east-1',
  currency: 'USD',
  freeTier: '12 months free tier on selected services',
  pricingModel: 'Pay-as-you-go + Reserved instances',
  lastVerified: '2024-01',
  note: 'Prices are estimates. Verify at aws.amazon.com/pricing',

  compute: [
    { name: 'EC2 t3.micro', cpu: 2, ram: 1, pricePerMonth: 7.59, included: { storage: 0, bandwidth: 0 }, type: 'compute' },
    { name: 'EC2 t3.small', cpu: 2, ram: 2, pricePerMonth: 15.18, included: { storage: 0, bandwidth: 0 }, type: 'compute' },
    { name: 'EC2 t3.medium', cpu: 2, ram: 4, pricePerMonth: 30.37, included: { storage: 0, bandwidth: 0 }, type: 'compute' },
    { name: 'EC2 t3.large', cpu: 2, ram: 8, pricePerMonth: 60.74, included: { storage: 0, bandwidth: 0 }, type: 'compute' },
    { name: 'EC2 t3.xlarge', cpu: 4, ram: 16, pricePerMonth: 121.47, included: { storage: 0, bandwidth: 0 }, type: 'compute' },
    { name: 'EC2 t3.2xlarge', cpu: 8, ram: 32, pricePerMonth: 242.94, included: { storage: 0, bandwidth: 0 }, type: 'compute' },
    { name: 'EC2 m5.large', cpu: 2, ram: 8, pricePerMonth: 69.12, included: { storage: 0, bandwidth: 0 }, type: 'compute' },
    { name: 'EC2 m5.xlarge', cpu: 4, ram: 16, pricePerMonth: 138.24, included: { storage: 0, bandwidth: 0 }, type: 'compute' },
    { name: 'EC2 m5.2xlarge', cpu: 8, ram: 32, pricePerMonth: 276.48, included: { storage: 0, bandwidth: 0 }, type: 'compute' },
    { name: 'EC2 c5.large', cpu: 2, ram: 4, pricePerMonth: 61.20, included: { storage: 0, bandwidth: 0 }, type: 'compute' },
    { name: 'EC2 c5.xlarge', cpu: 4, ram: 8, pricePerMonth: 122.40, included: { storage: 0, bandwidth: 0 }, type: 'compute' },
  ],

  database: [
    { name: 'RDS db.t3.micro', cpu: 2, ram: 1, storage: 20, pricePerMonth: 25.92, overagePerGB: 0.115, type: 'database' },
    { name: 'RDS db.t3.small', cpu: 2, ram: 2, storage: 20, pricePerMonth: 51.84, overagePerGB: 0.115, type: 'database' },
    { name: 'RDS db.t3.medium', cpu: 2, ram: 4, storage: 20, pricePerMonth: 103.68, overagePerGB: 0.115, type: 'database' },
    { name: 'RDS db.m5.large', cpu: 2, ram: 8, storage: 100, pricePerMonth: 185.76, overagePerGB: 0.115, type: 'database' },
    { name: 'RDS db.m5.xlarge', cpu: 4, ram: 16, storage: 200, pricePerMonth: 371.52, overagePerGB: 0.115, type: 'database' },
    { name: 'RDS db.m5.2xlarge', cpu: 8, ram: 32, storage: 500, pricePerMonth: 743.04, overagePerGB: 0.115, type: 'database' },
  ],

  storage: [
    { name: 'S3 Standard', pricePerGB: 0.023, included: 5, minCharge: 0, type: 'storage', billingUnit: 'GB/month' },
    { name: 'S3 Intelligent-Tiering', pricePerGB: 0.023, included: 0, monitoringFee: 0.0025, type: 'storage', billingUnit: 'GB/month' },
    { name: 'EBS gp3', pricePerGB: 0.08, included: 0, type: 'storage', billingUnit: 'GB/month' },
    { name: 'EFS Standard', pricePerGB: 0.30, included: 0, type: 'storage', billingUnit: 'GB/month' },
  ],

  network: [
    { name: 'ALB', pricePerMonth: 18.50, overageRate: 0.008, unit: 'LCU-hour', type: 'network' },
    { name: 'NAT Gateway', pricePerMonth: 32.40, overageRate: 0.045, unit: 'GB', type: 'network' },
    { name: 'CloudFront', pricePerGB: 0.0085, included: 1024, type: 'cdn' },
    { name: 'Route 53', pricePerZone: 0.50, pricePerQuery: 0.0000004, type: 'dns' },
    { name: 'Data Transfer Out', pricePerGB: 0.09, included: 100, type: 'egress' },
  ],

  serverless: [
    { name: 'Lambda', pricePerMillion: 0.20, includedRequests: 1000000, pricePerGBSec: 0.0000166667, type: 'serverless' },
    { name: 'API Gateway (REST)', pricePerMillion: 3.50, included: 1000000, type: 'api' },
  ],

  monitoring: [
    { name: 'CloudWatch', pricePerMetric: 0.30, pricePerGB: 0.50, type: 'monitoring' },
    { name: 'AWS Backup', pricePerGB: 0.05, type: 'backup' },
  ],

  // Capacity-to-load mapping for plan selector
  plans: [
    { name: 'EC2 t3.micro', cpu: 2, ram: 1, pricePerMonth: 7.59, cap: 40 },
    { name: 'EC2 t3.small', cpu: 2, ram: 2, pricePerMonth: 15.18, cap: 120 },
    { name: 'EC2 t3.medium', cpu: 2, ram: 4, pricePerMonth: 30.37, cap: 300 },
    { name: 'EC2 t3.large', cpu: 2, ram: 8, pricePerMonth: 60.74, cap: 700 },
    { name: 'EC2 t3.xlarge', cpu: 4, ram: 16, pricePerMonth: 121.47, cap: 1600 },
    { name: 'EC2 t3.2xlarge', cpu: 8, ram: 32, pricePerMonth: 242.94, cap: 3500 },
    { name: 'EC2 m5.xlarge', cpu: 4, ram: 16, pricePerMonth: 138.24, cap: 8000 },
    { name: 'EC2 m5.2xlarge', cpu: 8, ram: 32, pricePerMonth: 276.48, cap: 16000 },
  ],
  dbPlans: [
    { name: 'RDS db.t3.micro', cpu: 2, ram: 1, pricePerMonth: 25.92, cap: 150 },
    { name: 'RDS db.t3.small', cpu: 2, ram: 2, pricePerMonth: 51.84, cap: 500 },
    { name: 'RDS db.t3.medium', cpu: 2, ram: 4, pricePerMonth: 103.68, cap: 1500 },
    { name: 'RDS db.m5.large', cpu: 2, ram: 8, pricePerMonth: 185.76, cap: 4000 },
    { name: 'RDS db.m5.xlarge', cpu: 4, ram: 16, pricePerMonth: 371.52, cap: 10000 },
    { name: 'RDS db.m5.2xlarge', cpu: 8, ram: 32, pricePerMonth: 743.04, cap: 25000 },
  ],
  storageBase: 0.023,
  storageFree: 5,
  bandwidthBase: 0.09,
  bandwidthFree: 100,
};
