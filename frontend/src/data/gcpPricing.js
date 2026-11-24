// GCP Pricing Configuration
// Region: us-central1 | Currency: USD | Last verified: 2024-01
// All prices are estimates. Verify at https://cloud.google.com/pricing

export const gcpPricing = {
  id: 'gcp',
  name: 'Google Cloud Platform',
  shortName: 'GCP',
  color: '#4285F4',
  bgColor: '#E8F0FE',
  region: 'us-central1',
  currency: 'USD',
  freeTier: 'Always Free tier on selected services',
  pricingModel: 'Pay-as-you-go + Committed Use',
  lastVerified: '2024-01',
  note: 'Prices are estimates. Verify at cloud.google.com/pricing',

  compute: [
    { name: 'e2-micro (2vCPU/1GB)', cpu: 2, ram: 1, pricePerMonth: 6.11, type: 'compute' },
    { name: 'e2-small (2vCPU/2GB)', cpu: 2, ram: 2, pricePerMonth: 12.23, type: 'compute' },
    { name: 'e2-medium (2vCPU/4GB)', cpu: 2, ram: 4, pricePerMonth: 24.46, type: 'compute' },
    { name: 'e2-standard-2 (2vCPU/8GB)', cpu: 2, ram: 8, pricePerMonth: 48.92, type: 'compute' },
    { name: 'e2-standard-4 (4vCPU/16GB)', cpu: 4, ram: 16, pricePerMonth: 97.84, type: 'compute' },
    { name: 'e2-standard-8 (8vCPU/32GB)', cpu: 8, ram: 32, pricePerMonth: 195.67, type: 'compute' },
    { name: 'n2-standard-2 (2vCPU/8GB)', cpu: 2, ram: 8, pricePerMonth: 69.00, type: 'compute' },
    { name: 'n2-standard-4 (4vCPU/16GB)', cpu: 4, ram: 16, pricePerMonth: 138.00, type: 'compute' },
    { name: 'n2-standard-8 (8vCPU/32GB)', cpu: 8, ram: 32, pricePerMonth: 276.00, type: 'compute' },
  ],

  database: [
    { name: 'Cloud SQL db-f1-micro', cpu: 1, ram: 0.6, storage: 10, pricePerMonth: 7.67, overagePerGB: 0.17, type: 'database' },
    { name: 'Cloud SQL db-g1-small', cpu: 1, ram: 1.7, storage: 10, pricePerMonth: 25.46, overagePerGB: 0.17, type: 'database' },
    { name: 'Cloud SQL db-n1-standard-1', cpu: 1, ram: 3.75, storage: 10, pricePerMonth: 46.47, overagePerGB: 0.17, type: 'database' },
    { name: 'Cloud SQL db-n1-standard-2', cpu: 2, ram: 7.5, storage: 20, pricePerMonth: 92.94, overagePerGB: 0.17, type: 'database' },
    { name: 'Cloud SQL db-n1-standard-4', cpu: 4, ram: 15, storage: 50, pricePerMonth: 185.88, overagePerGB: 0.17, type: 'database' },
    { name: 'Cloud SQL db-n1-standard-8', cpu: 8, ram: 30, storage: 100, pricePerMonth: 371.75, overagePerGB: 0.17, type: 'database' },
  ],

  storage: [
    { name: 'Cloud Storage Standard', pricePerGB: 0.020, included: 5, type: 'storage', billingUnit: 'GB/month' },
    { name: 'Cloud Storage Nearline', pricePerGB: 0.010, included: 0, type: 'storage', billingUnit: 'GB/month' },
    { name: 'Persistent Disk SSD', pricePerGB: 0.17, included: 0, type: 'disk' },
    { name: 'Persistent Disk Standard', pricePerGB: 0.04, included: 0, type: 'disk' },
    { name: 'Filestore Basic', pricePerGB: 0.20, included: 0, type: 'storage' },
  ],

  network: [
    { name: 'Cloud Load Balancing', pricePerRule: 18.00, pricePerGB: 0.008, type: 'network' },
    { name: 'Cloud CDN', pricePerGB: 0.08, included: 0, type: 'cdn' },
    { name: 'Data Transfer Out', pricePerGB: 0.085, included: 200, type: 'egress' },
  ],

  serverless: [
    { name: 'Cloud Run', pricePerMillion: 0.40, includedRequests: 2000000, pricePerVCPUsec: 0.000024, type: 'serverless' },
    { name: 'Cloud Functions', pricePerMillion: 0.40, includedRequests: 2000000, type: 'serverless' },
    { name: 'API Gateway', pricePerMillion: 3.00, type: 'api' },
  ],

  monitoring: [
    { name: 'Cloud Monitoring', pricePerGB: 0.01, included: 50, type: 'monitoring' },
    { name: 'Cloud Backup', pricePerGB: 0.023, type: 'backup' },
  ],

  plans: [
    { name: 'e2-micro (2vCPU/1GB)', cpu: 2, ram: 1, pricePerMonth: 6.11, cap: 40 },
    { name: 'e2-small (2vCPU/2GB)', cpu: 2, ram: 2, pricePerMonth: 12.23, cap: 120 },
    { name: 'e2-medium (2vCPU/4GB)', cpu: 2, ram: 4, pricePerMonth: 24.46, cap: 300 },
    { name: 'e2-standard-2 (2vCPU/8GB)', cpu: 2, ram: 8, pricePerMonth: 48.92, cap: 700 },
    { name: 'e2-standard-4 (4vCPU/16GB)', cpu: 4, ram: 16, pricePerMonth: 97.84, cap: 1600 },
    { name: 'e2-standard-8 (8vCPU/32GB)', cpu: 8, ram: 32, pricePerMonth: 195.67, cap: 3500 },
    { name: 'n2-standard-4 (4vCPU/16GB)', cpu: 4, ram: 16, pricePerMonth: 138.00, cap: 8000 },
    { name: 'n2-standard-8 (8vCPU/32GB)', cpu: 8, ram: 32, pricePerMonth: 276.00, cap: 16000 },
  ],
  dbPlans: [
    { name: 'Cloud SQL db-f1-micro', cpu: 1, ram: 0.6, pricePerMonth: 7.67, cap: 150 },
    { name: 'Cloud SQL db-g1-small', cpu: 1, ram: 1.7, pricePerMonth: 25.46, cap: 500 },
    { name: 'Cloud SQL db-n1-standard-1', cpu: 1, ram: 3.75, pricePerMonth: 46.47, cap: 1500 },
    { name: 'Cloud SQL db-n1-standard-2', cpu: 2, ram: 7.5, pricePerMonth: 92.94, cap: 4000 },
    { name: 'Cloud SQL db-n1-standard-4', cpu: 4, ram: 15, pricePerMonth: 185.88, cap: 10000 },
    { name: 'Cloud SQL db-n1-standard-8', cpu: 8, ram: 30, pricePerMonth: 371.75, cap: 25000 },
  ],
  storageBase: 0.020,
  storageFree: 5,
  bandwidthBase: 0.085,
  bandwidthFree: 200,
};
