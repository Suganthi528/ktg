// Service Pricing Catalog — All 9 platforms
// Region: Primary (us-east-1 / East US / us-central1 etc.)
// Currency: USD | Last verified: 2024-01
// All prices are ESTIMATES. Do not present as verified live prices.
// Verify at each provider's official pricing page.

// ─── Billing model types ───────────────────────────────────────────────────────
// 'fixed'       → pricePerMonth flat
// 'hourly'      → pricePerHour × usageHours
// 'per_gb'      → pricePerGB × quantity
// 'per_million' → pricePerMillion × (requests / 1_000_000)
// 'per_iops'    → pricePerIOPS × iops
// 'per_cpu_hr'  → pricePerCPUHr × cpu × usageHours
// 'per_gb_hr'   → pricePerGBHr × ram × usageHours
// 'included'    → 0 (resource included in base plan, overage billed separately)
// ─────────────────────────────────────────────────────────────────────────────

export const SERVICE_CATALOG = {

  // ══════════════════════════════════════════════════════════════════
  // AWS
  // ══════════════════════════════════════════════════════════════════
  aws: {
    id: 'aws', name: 'Amazon Web Services', shortName: 'AWS',
    color: '#FF9900', bgColor: '#FFF8E6',
    region: 'us-east-1', currency: 'USD', lastVerified: '2024-01',
    sourceUrl: 'https://aws.amazon.com/pricing/',
    categories: {
      Compute: {
        EC2: {
          label: 'EC2 (Elastic Compute Cloud)',
          types: {
            'General Purpose': {
              plans: [
                { name: 't3.micro',   cpu: 2,  ram: 1,   pricePerHour: 0.0104, ebsOnly: true  },
                { name: 't3.small',   cpu: 2,  ram: 2,   pricePerHour: 0.0208, ebsOnly: true  },
                { name: 't3.medium',  cpu: 2,  ram: 4,   pricePerHour: 0.0416, ebsOnly: true  },
                { name: 't3.large',   cpu: 2,  ram: 8,   pricePerHour: 0.0832, ebsOnly: true  },
                { name: 't3.xlarge',  cpu: 4,  ram: 16,  pricePerHour: 0.1664, ebsOnly: true  },
                { name: 't3.2xlarge', cpu: 8,  ram: 32,  pricePerHour: 0.3328, ebsOnly: true  },
                { name: 'm5.large',   cpu: 2,  ram: 8,   pricePerHour: 0.096,  ebsOnly: true  },
                { name: 'm5.xlarge',  cpu: 4,  ram: 16,  pricePerHour: 0.192,  ebsOnly: true  },
                { name: 'm5.2xlarge', cpu: 8,  ram: 32,  pricePerHour: 0.384,  ebsOnly: true  },
                { name: 'm5.4xlarge', cpu: 16, ram: 64,  pricePerHour: 0.768,  ebsOnly: true  },
              ],
            },
            'Compute Optimized': {
              plans: [
                { name: 'c5.large',   cpu: 2,  ram: 4,   pricePerHour: 0.085, ebsOnly: true },
                { name: 'c5.xlarge',  cpu: 4,  ram: 8,   pricePerHour: 0.170, ebsOnly: true },
                { name: 'c5.2xlarge', cpu: 8,  ram: 16,  pricePerHour: 0.340, ebsOnly: true },
                { name: 'c5.4xlarge', cpu: 16, ram: 32,  pricePerHour: 0.680, ebsOnly: true },
              ],
            },
            'Memory Optimized': {
              plans: [
                { name: 'r5.large',   cpu: 2,  ram: 16,  pricePerHour: 0.126, ebsOnly: true },
                { name: 'r5.xlarge',  cpu: 4,  ram: 32,  pricePerHour: 0.252, ebsOnly: true },
                { name: 'r5.2xlarge', cpu: 8,  ram: 64,  pricePerHour: 0.504, ebsOnly: true },
                { name: 'r5.4xlarge', cpu: 16, ram: 128, pricePerHour: 1.008, ebsOnly: true },
              ],
            },
            'Storage Optimized': {
              plans: [
                { name: 'i3.large',   cpu: 2,  ram: 15.25, pricePerHour: 0.156, localSSD: 475  },
                { name: 'i3.xlarge',  cpu: 4,  ram: 30.5,  pricePerHour: 0.312, localSSD: 950  },
                { name: 'i3.2xlarge', cpu: 8,  ram: 61,    pricePerHour: 0.624, localSSD: 1900 },
              ],
            },
          },
          billingModel: 'hourly',
          extraCosts: {
            storagePerGB: 0.08,     // EBS gp3 $/GB/mo
            bandwidthPerGB: 0.09,   // data transfer out
            os: { 'Linux': 0, 'Windows': 0.016 }, // extra $/hr for Windows
          },
        },
        Lambda: {
          label: 'AWS Lambda (Serverless)',
          types: {
            'Serverless Functions': {
              plans: [
                { name: 'Lambda',  cpu: 0, ram: 0, pricePerMonth: 0 },
              ],
            },
          },
          billingModel: 'per_million',
          extraCosts: {
            requestPricePerMillion: 0.20,
            durationPricePerGBSec: 0.0000166667,
            includedRequests: 1000000,
            includedGBSec: 400000,
          },
        },
      },
      Database: {
        RDS: {
          label: 'Amazon RDS',
          types: {
            MySQL:      { plans: [ { name:'db.t3.micro',cpu:2,ram:1,pricePerHour:0.036,storage:20,connections:60   }, { name:'db.t3.small',cpu:2,ram:2,pricePerHour:0.072,storage:20,connections:150  }, { name:'db.t3.medium',cpu:2,ram:4,pricePerHour:0.144,storage:20,connections:312  }, { name:'db.m5.large',cpu:2,ram:8,pricePerHour:0.258,storage:100,connections:683  }, { name:'db.m5.xlarge',cpu:4,ram:16,pricePerHour:0.516,storage:200,connections:1365 }, { name:'db.m5.2xlarge',cpu:8,ram:32,pricePerHour:1.032,storage:500,connections:2730 } ] },
            PostgreSQL: { plans: [ { name:'db.t3.micro',cpu:2,ram:1,pricePerHour:0.036,storage:20,connections:60   }, { name:'db.t3.small',cpu:2,ram:2,pricePerHour:0.072,storage:20,connections:150  }, { name:'db.t3.medium',cpu:2,ram:4,pricePerHour:0.144,storage:20,connections:312  }, { name:'db.m5.large',cpu:2,ram:8,pricePerHour:0.258,storage:100,connections:683  }, { name:'db.m5.xlarge',cpu:4,ram:16,pricePerHour:0.516,storage:200,connections:1365 }, { name:'db.m5.2xlarge',cpu:8,ram:32,pricePerHour:1.032,storage:500,connections:2730 } ] },
            MariaDB:    { plans: [ { name:'db.t3.micro',cpu:2,ram:1,pricePerHour:0.036,storage:20,connections:60   }, { name:'db.t3.medium',cpu:2,ram:4,pricePerHour:0.144,storage:20,connections:312  }, { name:'db.m5.large',cpu:2,ram:8,pricePerHour:0.258,storage:100,connections:683  } ] },
            'SQL Server': { plans: [ { name:'db.t3.small(SE)',cpu:2,ram:2,pricePerHour:0.200,storage:20,connections:50  }, { name:'db.m5.large(SE)',cpu:2,ram:8,pricePerHour:0.750,storage:100,connections:200 }, { name:'db.m5.xlarge(SE)',cpu:4,ram:16,pricePerHour:1.500,storage:200,connections:400} ] },
            Oracle:     { plans: [ { name:'db.t3.small(SE2)',cpu:2,ram:2,pricePerHour:0.228,storage:20,connections:50 }, { name:'db.m5.large(SE2)',cpu:2,ram:8,pricePerHour:0.892,storage:100,connections:200}, { name:'db.m5.xlarge(EE)',cpu:4,ram:16,pricePerHour:3.500,storage:200,connections:400} ] },
          },
          billingModel: 'hourly',
          extraCosts: { storagePerGB: 0.115, backupPerGB: 0.095, iopsPerUnit: 0.10, multiAZMultiplier: 2, dataTransferPerGB: 0.09 },
        },
        Aurora: {
          label: 'Amazon Aurora',
          types: {
            'MySQL Compatible':      { plans: [ { name:'db.t3.medium',cpu:2,ram:4,pricePerHour:0.082,storage:10,connections:312}, { name:'db.r5.large',cpu:2,ram:16,pricePerHour:0.285,storage:10,connections:1000}, { name:'db.r5.xlarge',cpu:4,ram:32,pricePerHour:0.570,storage:10,connections:2000}, { name:'db.r5.2xlarge',cpu:8,ram:64,pricePerHour:1.140,storage:10,connections:4000} ] },
            'PostgreSQL Compatible': { plans: [ { name:'db.t3.medium',cpu:2,ram:4,pricePerHour:0.082,storage:10,connections:312}, { name:'db.r5.large',cpu:2,ram:16,pricePerHour:0.285,storage:10,connections:1000}, { name:'db.r5.xlarge',cpu:4,ram:32,pricePerHour:0.570,storage:10,connections:2000} ] },
          },
          billingModel: 'hourly',
          extraCosts: { storagePerGB: 0.10, backupPerGB: 0.021, iopsPerUnit: 0.20, dataTransferPerGB: 0.08 },
        },
        DynamoDB: {
          label: 'Amazon DynamoDB',
          types: {
            'On-Demand': { plans: [ { name:'DynamoDB On-Demand',cpu:0,ram:0,pricePerMonth:0,storage:25 } ] },
            'Provisioned': { plans: [ { name:'DynamoDB Provisioned',cpu:0,ram:0,pricePerMonth:0,storage:25 } ] },
          },
          billingModel: 'per_million',
          extraCosts: { storagePerGB:0.25, backupPerGB:0.10, readPerMillion:0.25, writePerMillion:1.25, dataTransferPerGB:0.09 },
        },
      },
      Storage: {
        S3: {
          label: 'Amazon S3',
          types: {
            'Standard':                { pricePerGB: 0.023, getPerThousand: 0.0004, putPerThousand: 0.005, retrievalPerGB: 0,     minStorageDays: 0  },
            'Intelligent-Tiering':     { pricePerGB: 0.023, getPerThousand: 0.0004, putPerThousand: 0.005, retrievalPerGB: 0,     minStorageDays: 0  },
            'Standard-IA':             { pricePerGB: 0.0125,getPerThousand: 0.001,  putPerThousand: 0.01,  retrievalPerGB: 0.01,  minStorageDays: 30 },
            'One Zone-IA':             { pricePerGB: 0.01,  getPerThousand: 0.001,  putPerThousand: 0.01,  retrievalPerGB: 0.01,  minStorageDays: 30 },
            'Glacier Instant':         { pricePerGB: 0.004, getPerThousand: 0.01,   putPerThousand: 0.02,  retrievalPerGB: 0.03,  minStorageDays: 90 },
            'Glacier Flexible':        { pricePerGB: 0.0036,getPerThousand: 0.05,   putPerThousand: 0.05,  retrievalPerGB: 0.01,  minStorageDays: 90 },
            'Glacier Deep Archive':    { pricePerGB: 0.00099,getPerThousand:0.10,   putPerThousand: 0.10,  retrievalPerGB: 0.02,  minStorageDays: 180},
          },
          billingModel: 'per_gb',
          extraCosts: { dataTransferPerGB: 0.09, dataTransferFree: 100 },
        },
        EBS: {
          label: 'Amazon EBS',
          types: {
            'gp3 (General Purpose SSD)':  { pricePerGB: 0.08,  iopsIncluded: 3000, iopsPerUnit: 0.005, throughputMBIncluded: 125 },
            'gp2 (General Purpose SSD)':  { pricePerGB: 0.10,  iopsIncluded: 0,    iopsPerUnit: 0,     throughputMBIncluded: 0   },
            'io1 (Provisioned IOPS SSD)': { pricePerGB: 0.125, iopsIncluded: 0,    iopsPerUnit: 0.065, throughputMBIncluded: 0   },
            'io2 (Provisioned IOPS SSD)': { pricePerGB: 0.125, iopsIncluded: 0,    iopsPerUnit: 0.065, throughputMBIncluded: 0   },
            'st1 (Throughput HDD)':       { pricePerGB: 0.045, iopsIncluded: 0,    iopsPerUnit: 0,     throughputMBIncluded: 0   },
            'sc1 (Cold HDD)':             { pricePerGB: 0.025, iopsIncluded: 0,    iopsPerUnit: 0,     throughputMBIncluded: 0   },
          },
          billingModel: 'per_gb',
        },
      },
      Networking: {
        'ALB': {
          label: 'Application Load Balancer',
          types: { 'Application LB': { pricePerHour: 0.008, lcuPerHour: 0.008 } },
          billingModel: 'hourly',
          extraCosts: { dataProcessedPerGB: 0 },
        },
        'NAT Gateway': {
          label: 'NAT Gateway',
          types: { 'NAT Gateway': { pricePerHour: 0.045, dataProcessedPerGB: 0.045 } },
          billingModel: 'hourly',
        },
        CloudFront: {
          label: 'Amazon CloudFront (CDN)',
          types: { 'CDN': { pricePerGB: 0.0085, requestPer10K: 0.01, includedGB: 1024 } },
          billingModel: 'per_gb',
        },
        'Route 53': {
          label: 'Route 53 (DNS)',
          types: { 'DNS': { hostedZonePerMonth: 0.50, queryPer1M: 0.40 } },
          billingModel: 'fixed',
        },
      },
      Serverless: {
        'API Gateway': {
          label: 'API Gateway (REST)',
          types: { 'REST API': { requestPricePerMillion: 3.50, cachePerHour: 0.038, includedRequests: 1000000 } },
          billingModel: 'per_million',
        },
      },
      Monitoring: {
        CloudWatch: {
          label: 'Amazon CloudWatch',
          types: { 'Monitoring': { metricsPerMonth: 0.30, logsPerGB: 0.50, dashboardPerMonth: 3.00 } },
          billingModel: 'fixed',
        },
      },
      Backup: {
        'AWS Backup': {
          label: 'AWS Backup',
          types: { 'Backup': { warmBackupPerGB: 0.05, coldBackupPerGB: 0.01, restorePerGB: 0.02 } },
          billingModel: 'per_gb',
        },
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // AZURE
  // ══════════════════════════════════════════════════════════════════
  azure: {
    id: 'azure', name: 'Microsoft Azure', shortName: 'Azure',
    color: '#0078D4', bgColor: '#E6F2FF',
    region: 'East US', currency: 'USD', lastVerified: '2024-01',
    sourceUrl: 'https://azure.microsoft.com/pricing/',
    categories: {
      Compute: {
        'Virtual Machines': {
          label: 'Azure Virtual Machines',
          types: {
            'General Purpose':    { plans: [ { name:'B1s',cpu:1,ram:1,pricePerHour:0.0104}, { name:'B2s',cpu:2,ram:4,pricePerHour:0.0416}, { name:'D2s_v3',cpu:2,ram:8,pricePerHour:0.096}, { name:'D4s_v3',cpu:4,ram:16,pricePerHour:0.192}, { name:'D8s_v3',cpu:8,ram:32,pricePerHour:0.384}, { name:'D16s_v3',cpu:16,ram:64,pricePerHour:0.768} ] },
            'Compute Optimized':  { plans: [ { name:'F2s_v2',cpu:2,ram:4,pricePerHour:0.085}, { name:'F4s_v2',cpu:4,ram:8,pricePerHour:0.170}, { name:'F8s_v2',cpu:8,ram:16,pricePerHour:0.340} ] },
            'Memory Optimized':   { plans: [ { name:'E2s_v3',cpu:2,ram:16,pricePerHour:0.126}, { name:'E4s_v3',cpu:4,ram:32,pricePerHour:0.252}, { name:'E8s_v3',cpu:8,ram:64,pricePerHour:0.504} ] },
            'Storage Optimized':  { plans: [ { name:'L4s',cpu:4,ram:32,pricePerHour:0.360}, { name:'L8s',cpu:8,ram:64,pricePerHour:0.720} ] },
          },
          billingModel: 'hourly',
          extraCosts: { storagePerGB: 0.05, bandwidthPerGB: 0.087 },
        },
        'Azure Functions': {
          label: 'Azure Functions (Serverless)',
          types: { 'Serverless': { plans: [ { name:'Consumption Plan',cpu:0,ram:0,pricePerMonth:0 } ] } },
          billingModel: 'per_million',
          extraCosts: { requestPricePerMillion: 0.20, durationPricePerGBSec: 0.000016, includedRequests: 1000000 },
        },
      },
      Database: {
        'Azure SQL': {
          label: 'Azure SQL Database',
          types: {
            'General Purpose': { plans: [ { name:'GP 2vCores',cpu:2,ram:10,pricePerHour:0.256,storage:32}, { name:'GP 4vCores',cpu:4,ram:20,pricePerHour:0.513,storage:100}, { name:'GP 8vCores',cpu:8,ram:40,pricePerHour:1.026,storage:200} ] },
            'Business Critical': { plans: [ { name:'BC 2vCores',cpu:2,ram:10,pricePerHour:0.769,storage:32}, { name:'BC 4vCores',cpu:4,ram:20,pricePerHour:1.538,storage:100} ] },
            'Serverless':       { plans: [ { name:'Serverless 1vCore',cpu:1,ram:3,pricePerHour:0.000145,storage:32,note:'per vCore-sec'} ] },
          },
          billingModel: 'hourly',
          extraCosts: { storagePerGB: 0.115, backupPerGB: 0.05, dataTransferPerGB: 0.087 },
        },
        'Cosmos DB': {
          label: 'Azure Cosmos DB',
          types: {
            'Serverless': { plans: [ { name:'Serverless',cpu:0,ram:0,pricePerMonth:0,storage:25 } ] },
            'Provisioned': { plans: [ { name:'400 RU/s',cpu:0,ram:0,pricePerMonth:23.36,storage:25}, { name:'1000 RU/s',cpu:0,ram:0,pricePerMonth:58.40,storage:100} ] },
          },
          billingModel: 'per_million',
          extraCosts: { storagePerGB: 0.25, backupPerGB: 0.10, readPerMillion: 0.28, writePerMillion: 1.40 },
        },
      },
      Storage: {
        'Blob Storage': {
          label: 'Azure Blob Storage',
          types: {
            'Hot':  { pricePerGB: 0.018, writePerThousand: 0.05, readPerThousand: 0.004 },
            'Cool': { pricePerGB: 0.01,  writePerThousand: 0.10, readPerThousand: 0.01  },
            'Archive': { pricePerGB: 0.00099, writePerThousand: 0.10, readPerThousand: 5.00 },
          },
          billingModel: 'per_gb',
          extraCosts: { dataTransferPerGB: 0.087, dataTransferFree: 100 },
        },
        'Managed Disks': {
          label: 'Azure Managed Disks',
          types: {
            'P10 (128GB SSD)':  { pricePerMonth: 19.71,  sizeGB: 128 },
            'P20 (512GB SSD)':  { pricePerMonth: 73.22,  sizeGB: 512 },
            'P30 (1TB SSD)':    { pricePerMonth: 135.17, sizeGB: 1024},
            'E10 (128GB HDD)':  { pricePerMonth: 8.00,   sizeGB: 128 },
          },
          billingModel: 'fixed',
        },
      },
      Networking: {
        'Application Gateway': {
          label: 'Azure Application Gateway',
          types: { 'WAF v2': { pricePerHour: 0.144, capacityUnitPerHour: 0.008 } },
          billingModel: 'hourly',
        },
        'Azure CDN': {
          label: 'Azure CDN',
          types: { 'CDN': { pricePerGB: 0.081, includedGB: 0 } },
          billingModel: 'per_gb',
        },
      },
      Monitoring: {
        'Azure Monitor': {
          label: 'Azure Monitor',
          types: { 'Monitoring': { logsPerGB: 2.76, metricsPerSeries: 0.10 } },
          billingModel: 'per_gb',
        },
      },
      Backup: {
        'Azure Backup': {
          label: 'Azure Backup',
          types: { 'Backup': { backupPerGB: 0.03, restorePerGB: 0.02 } },
          billingModel: 'per_gb',
        },
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // GCP
  // ══════════════════════════════════════════════════════════════════
  gcp: {
    id: 'gcp', name: 'Google Cloud Platform', shortName: 'GCP',
    color: '#4285F4', bgColor: '#E8F0FE',
    region: 'us-central1', currency: 'USD', lastVerified: '2024-01',
    sourceUrl: 'https://cloud.google.com/pricing',
    categories: {
      Compute: {
        'Compute Engine': {
          label: 'Compute Engine (VMs)',
          types: {
            'General Purpose':  { plans: [ { name:'e2-micro',cpu:2,ram:1,pricePerHour:0.0085}, { name:'e2-small',cpu:2,ram:2,pricePerHour:0.0170}, { name:'e2-medium',cpu:2,ram:4,pricePerHour:0.0340}, { name:'e2-standard-2',cpu:2,ram:8,pricePerHour:0.0680}, { name:'e2-standard-4',cpu:4,ram:16,pricePerHour:0.1360}, { name:'e2-standard-8',cpu:8,ram:32,pricePerHour:0.2720}, { name:'n2-standard-2',cpu:2,ram:8,pricePerHour:0.0958}, { name:'n2-standard-4',cpu:4,ram:16,pricePerHour:0.1917} ] },
            'Compute Optimized':{ plans: [ { name:'c2-standard-4',cpu:4,ram:16,pricePerHour:0.2088}, { name:'c2-standard-8',cpu:8,ram:32,pricePerHour:0.4176} ] },
            'Memory Optimized': { plans: [ { name:'m1-megamem-96',cpu:96,ram:1433,pricePerHour:10.674}, { name:'n2-highmem-2',cpu:2,ram:16,pricePerHour:0.1310}, { name:'n2-highmem-4',cpu:4,ram:32,pricePerHour:0.2619} ] },
          },
          billingModel: 'hourly',
          extraCosts: { storagePerGB: 0.04, bandwidthPerGB: 0.085 },
        },
        'Cloud Run': {
          label: 'Cloud Run (Serverless Containers)',
          types: { 'Serverless': { plans: [ { name:'Cloud Run',cpu:0,ram:0,pricePerMonth:0 } ] } },
          billingModel: 'per_cpu_hr',
          extraCosts: { cpuPerVCPUSec: 0.000024, ramPerGBSec: 0.0000025, requestPricePerMillion: 0.40, includedRequests: 2000000 },
        },
      },
      Database: {
        'Cloud SQL': {
          label: 'GCP Cloud SQL',
          types: {
            MySQL:      { plans: [ { name:'db-f1-micro',cpu:1,ram:0.6,pricePerHour:0.0107,storage:10}, { name:'db-g1-small',cpu:1,ram:1.7,pricePerHour:0.0353,storage:10}, { name:'db-n1-standard-1',cpu:1,ram:3.75,pricePerHour:0.0645,storage:10}, { name:'db-n1-standard-2',cpu:2,ram:7.5,pricePerHour:0.1291,storage:20}, { name:'db-n1-standard-4',cpu:4,ram:15,pricePerHour:0.2581,storage:50} ] },
            PostgreSQL: { plans: [ { name:'db-f1-micro',cpu:1,ram:0.6,pricePerHour:0.0107,storage:10}, { name:'db-g1-small',cpu:1,ram:1.7,pricePerHour:0.0353,storage:10}, { name:'db-n1-standard-1',cpu:1,ram:3.75,pricePerHour:0.0645,storage:10}, { name:'db-n1-standard-2',cpu:2,ram:7.5,pricePerHour:0.1291,storage:20} ] },
            'SQL Server':{ plans: [ { name:'db-n1-standard-1(MSSQL)',cpu:1,ram:3.75,pricePerHour:0.280,storage:10}, { name:'db-n1-standard-2(MSSQL)',cpu:2,ram:7.5,pricePerHour:0.560,storage:20} ] },
          },
          billingModel: 'hourly',
          extraCosts: { storagePerGB: 0.17, backupPerGB: 0.08, haMultiplier: 2, dataTransferPerGB: 0.085 },
        },
        'Firestore': {
          label: 'GCP Firestore',
          types: {
            'Spark (Free)': { plans: [ { name:'Spark',cpu:0,ram:0,pricePerMonth:0,storage:1 } ] },
            'Blaze (Pay-as-you-go)': { plans: [ { name:'Blaze',cpu:0,ram:0,pricePerMonth:0,storage:999999 } ] },
          },
          billingModel: 'per_million',
          extraCosts: { storagePerGB: 0.18, readPerMillion: 0.06, writePerMillion: 0.18, dataTransferPerGB: 0.12 },
        },
      },
      Storage: {
        'Cloud Storage': {
          label: 'GCP Cloud Storage',
          types: {
            'Standard':  { pricePerGB: 0.020, operationsPer10K: 0.004 },
            'Nearline':  { pricePerGB: 0.010, operationsPer10K: 0.01, minStorageDays: 30 },
            'Coldline':  { pricePerGB: 0.004, operationsPer10K: 0.05, minStorageDays: 90 },
            'Archive':   { pricePerGB: 0.0012,operationsPer10K: 0.50, minStorageDays: 365 },
          },
          billingModel: 'per_gb',
          extraCosts: { dataTransferPerGB: 0.085, dataTransferFree: 200 },
        },
        'Persistent Disk': {
          label: 'Persistent Disk',
          types: {
            'Standard (HDD)': { pricePerGB: 0.04, iopsPerUnit: 0 },
            'SSD':            { pricePerGB: 0.17, iopsPerUnit: 0 },
            'Extreme SSD':    { pricePerGB: 0.125, iopsPerUnit: 0.000074 },
          },
          billingModel: 'per_gb',
        },
      },
      Networking: {
        'Cloud Load Balancing': {
          label: 'Cloud Load Balancing',
          types: { 'Global LB': { pricePerHour: 0.025, forwardingRulePerHour: 0.025, dataProcessedPerGB: 0.008 } },
          billingModel: 'hourly',
        },
        'Cloud CDN': {
          label: 'Cloud CDN',
          types: { 'CDN': { pricePerGB: 0.08, cacheFillPerGB: 0.04, includedGB: 0 } },
          billingModel: 'per_gb',
        },
      },
      Monitoring: {
        'Cloud Monitoring': {
          label: 'Cloud Monitoring',
          types: { 'Monitoring': { metricsPerMBIngested: 0.01, includedMB: 50000 } },
          billingModel: 'per_gb',
        },
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // DigitalOcean
  // ══════════════════════════════════════════════════════════════════
  digitalocean: {
    id: 'digitalocean', name: 'DigitalOcean', shortName: 'DigitalOcean',
    color: '#0080FF', bgColor: '#E5F2FF',
    region: 'NYC3', currency: 'USD', lastVerified: '2024-01',
    sourceUrl: 'https://www.digitalocean.com/pricing/',
    categories: {
      Compute: {
        Droplets: {
          label: 'Droplets (VPS)',
          types: {
            'Basic':    { plans: [ { name:'Basic 1GB',cpu:1,ram:1,storage:25,bandwidth:1000,pricePerMonth:6  }, { name:'Basic 2GB',cpu:1,ram:2,storage:50,bandwidth:2000,pricePerMonth:12 }, { name:'Basic 4GB',cpu:2,ram:4,storage:80,bandwidth:4000,pricePerMonth:24 }, { name:'Basic 8GB',cpu:4,ram:8,storage:160,bandwidth:5000,pricePerMonth:48 } ] },
            'General':  { plans: [ { name:'General 8GB',cpu:2,ram:8,storage:25,bandwidth:4000,pricePerMonth:63  }, { name:'General 16GB',cpu:4,ram:16,storage:50,bandwidth:5000,pricePerMonth:126 }, { name:'General 32GB',cpu:8,ram:32,storage:100,bandwidth:6000,pricePerMonth:252 } ] },
            'CPU-Optimized': { plans: [ { name:'CPU-Opt 4GB',cpu:2,ram:4,storage:25,bandwidth:4000,pricePerMonth:42 }, { name:'CPU-Opt 8GB',cpu:4,ram:8,storage:50,bandwidth:5000,pricePerMonth:84 } ] },
          },
          billingModel: 'fixed',
          extraCosts: { bandwidthOveragePerGB: 0.01, bandwidthIncluded: true },
        },
      },
      Database: {
        'Managed DB': {
          label: 'Managed Databases',
          types: {
            PostgreSQL: { plans: [ { name:'DB 1GB',cpu:1,ram:1,storage:10,pricePerMonth:15}, { name:'DB 2GB',cpu:1,ram:2,storage:25,pricePerMonth:30}, { name:'DB 4GB',cpu:2,ram:4,storage:38,pricePerMonth:60}, { name:'DB 8GB',cpu:2,ram:8,storage:115,pricePerMonth:120}, { name:'DB 16GB',cpu:4,ram:16,storage:270,pricePerMonth:240} ] },
            MySQL:      { plans: [ { name:'DB 1GB',cpu:1,ram:1,storage:10,pricePerMonth:15}, { name:'DB 2GB',cpu:1,ram:2,storage:25,pricePerMonth:30}, { name:'DB 4GB',cpu:2,ram:4,storage:38,pricePerMonth:60}, { name:'DB 8GB',cpu:2,ram:8,storage:115,pricePerMonth:120} ] },
            Redis:      { plans: [ { name:'Cache 1GB',cpu:1,ram:1,storage:0,pricePerMonth:15}, { name:'Cache 2GB',cpu:1,ram:2,storage:0,pricePerMonth:30} ] },
            MongoDB:    { plans: [ { name:'DB 2GB',cpu:1,ram:2,storage:25,pricePerMonth:30}, { name:'DB 4GB',cpu:2,ram:4,storage:38,pricePerMonth:60} ] },
          },
          billingModel: 'fixed',
          extraCosts: { storageOveragePerGB: 0.10, backupPerGB: 0.023, haMultiplier: 2 },
        },
      },
      Storage: {
        Spaces: {
          label: 'Spaces (Object Storage)',
          types: { 'Spaces': { basePrice: 5, includedStorage: 250, includedBandwidth: 1024, extraStoragePerGB: 0.02, extraBandwidthPerGB: 0.01 } },
          billingModel: 'fixed',
        },
        'Block Storage': {
          label: 'Block Storage Volumes',
          types: { 'SSD Volume': { pricePerGB: 0.10 } },
          billingModel: 'per_gb',
        },
      },
      Networking: {
        'Load Balancers': {
          label: 'Load Balancers',
          types: { 'LB': { pricePerMonth: 12, bandwidthOveragePerGB: 0.01 } },
          billingModel: 'fixed',
        },
      },
      Backup: {
        Backups: {
          label: 'Droplet Backups',
          types: { 'Automated Backups': { pctOfDroplet: 0.20, note: '20% of Droplet price' } },
          billingModel: 'fixed',
        },
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // LINODE
  // ══════════════════════════════════════════════════════════════════
  linode: {
    id: 'linode', name: 'Linode (Akamai)', shortName: 'Linode',
    color: '#02B159', bgColor: '#E5F9EE',
    region: 'us-east', currency: 'USD', lastVerified: '2024-01',
    sourceUrl: 'https://www.linode.com/pricing/',
    categories: {
      Compute: {
        'Compute Instances': {
          label: 'Linode Compute Instances',
          types: {
            'Shared':    { plans: [ { name:'Nanode 1GB',cpu:1,ram:1,storage:25,bandwidth:1000,pricePerMonth:5  }, { name:'Linode 2GB',cpu:1,ram:2,storage:50,bandwidth:2000,pricePerMonth:12 }, { name:'Linode 4GB',cpu:2,ram:4,storage:80,bandwidth:4000,pricePerMonth:24 }, { name:'Linode 8GB',cpu:4,ram:8,storage:160,bandwidth:5000,pricePerMonth:48 }, { name:'Linode 16GB',cpu:6,ram:16,storage:320,bandwidth:8000,pricePerMonth:96 }, { name:'Linode 32GB',cpu:8,ram:32,storage:640,bandwidth:12000,pricePerMonth:192} ] },
            'Dedicated': { plans: [ { name:'Dedicated 4GB',cpu:2,ram:4,storage:80,bandwidth:4000,pricePerMonth:36 }, { name:'Dedicated 8GB',cpu:4,ram:8,storage:160,bandwidth:5000,pricePerMonth:72 }, { name:'Dedicated 16GB',cpu:8,ram:16,storage:320,bandwidth:6000,pricePerMonth:144} ] },
            'High Memory': { plans: [ { name:'HighMem 24GB',cpu:2,ram:24,storage:20,bandwidth:5000,pricePerMonth:60 }, { name:'HighMem 48GB',cpu:2,ram:48,storage:40,bandwidth:6000,pricePerMonth:120} ] },
          },
          billingModel: 'fixed',
          extraCosts: { bandwidthOveragePerGB: 0.01, bandwidthIncluded: true },
        },
      },
      Database: {
        'Managed DB': {
          label: 'Managed Databases',
          types: {
            MySQL:      { plans: [ { name:'DB 1GB',cpu:1,ram:1,storage:15,pricePerMonth:15}, { name:'DB 2GB',cpu:2,ram:2,storage:40,pricePerMonth:30}, { name:'DB 4GB',cpu:2,ram:4,storage:75,pricePerMonth:60}, { name:'DB 8GB',cpu:4,ram:8,storage:165,pricePerMonth:120}, { name:'DB 16GB',cpu:6,ram:16,storage:325,pricePerMonth:240} ] },
            PostgreSQL: { plans: [ { name:'DB 1GB',cpu:1,ram:1,storage:15,pricePerMonth:15}, { name:'DB 2GB',cpu:2,ram:2,storage:40,pricePerMonth:30}, { name:'DB 4GB',cpu:2,ram:4,storage:75,pricePerMonth:60}, { name:'DB 8GB',cpu:4,ram:8,storage:165,pricePerMonth:120} ] },
          },
          billingModel: 'fixed',
          extraCosts: { storageOveragePerGB: 0.10, backupPerGB: 0.02, haMultiplier: 2 },
        },
      },
      Storage: {
        'Object Storage': {
          label: 'Object Storage',
          types: { 'Object Storage': { basePrice: 5, includedStorage: 250, includedBandwidth: 1024, extraStoragePerGB: 0.02, extraBandwidthPerGB: 0.01 } },
          billingModel: 'fixed',
        },
        'Block Storage': {
          label: 'Block Storage',
          types: { 'SSD': { pricePerGB: 0.10 } },
          billingModel: 'per_gb',
        },
      },
      Networking: {
        NodeBalancers: {
          label: 'NodeBalancers (Load Balancers)',
          types: { 'NodeBalancer': { pricePerMonth: 10, bandwidthOveragePerGB: 0.01 } },
          billingModel: 'fixed',
        },
      },
      Backup: {
        Backups: {
          label: 'Linode Backups',
          types: { 'Automated': { pctOfLinode: 0.25, note: '25% of Linode price' } },
          billingModel: 'fixed',
        },
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════
  render: {
    id: 'render', name: 'Render', shortName: 'Render',
    color: '#46E3B7', bgColor: '#E5FDF7',
    region: 'Global', currency: 'USD', lastVerified: '2024-01',
    sourceUrl: 'https://render.com/pricing',
    categories: {
      Compute: {
        'Web Services': {
          label: 'Web Services',
          types: {
            'Shared': { plans: [ { name:'Free',cpu:0.1,ram:0.25,pricePerMonth:0,note:'Spins down on inactivity'}, { name:'Starter',cpu:0.5,ram:0.5,pricePerMonth:7}, { name:'Standard',cpu:1,ram:2,pricePerMonth:25}, { name:'Pro',cpu:2,ram:4,pricePerMonth:85}, { name:'Pro Plus',cpu:4,ram:8,pricePerMonth:175}, { name:'Pro Max',cpu:4,ram:16,pricePerMonth:225}, { name:'Pro Ultra',cpu:8,ram:32,pricePerMonth:450} ] },
          },
          billingModel: 'fixed',
          extraCosts: { bandwidthFree: 100, bandwidthPerGB: 0 },
        },
        'Background Workers': {
          label: 'Background Workers',
          types: {
            'Workers': { plans: [ { name:'Starter',cpu:0.5,ram:0.5,pricePerMonth:7}, { name:'Standard',cpu:1,ram:2,pricePerMonth:25}, { name:'Pro',cpu:2,ram:4,pricePerMonth:85} ] },
          },
          billingModel: 'fixed',
        },
      },
      Database: {
        PostgreSQL: {
          label: 'Render PostgreSQL',
          types: {
            'PostgreSQL': { plans: [ { name:'Free (90d)',cpu:0.1,ram:0.25,storage:1,pricePerMonth:0,note:'90-day trial'}, { name:'Starter',cpu:1,ram:1,storage:10,pricePerMonth:7}, { name:'Standard',cpu:1,ram:4,storage:50,pricePerMonth:20}, { name:'Pro',cpu:2,ram:8,storage:100,pricePerMonth:50}, { name:'Pro Plus',cpu:4,ram:16,storage:256,pricePerMonth:130} ] },
          },
          billingModel: 'fixed',
          extraCosts: { storageOveragePerGB: 0.30 },
        },
        Redis: {
          label: 'Render Redis / Key Value',
          types: {
            'Redis': { plans: [ { name:'Free',pricePerMonth:0,storage:25,note:'25MB'}, { name:'Starter',pricePerMonth:10,storage:1024}, { name:'Standard',pricePerMonth:30,storage:5120} ] },
          },
          billingModel: 'fixed',
        },
      },
      Storage: {
        'Persistent Disk': {
          label: 'Persistent Disks',
          types: { 'SSD': { pricePerGB: 0.25 } },
          billingModel: 'per_gb',
        },
        'Static Sites': {
          label: 'Static Sites',
          types: { 'Free Static': { pricePerMonth: 0, note: 'Free for static hosting' } },
          billingModel: 'fixed',
        },
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // RAILWAY
  // ══════════════════════════════════════════════════════════════════
  railway: {
    id: 'railway', name: 'Railway', shortName: 'Railway',
    color: '#B44FEA', bgColor: '#F5E8FD',
    region: 'Global', currency: 'USD', lastVerified: '2024-01',
    sourceUrl: 'https://railway.app/pricing',
    categories: {
      Compute: {
        'Services': {
          label: 'Railway Services',
          types: {
            'Hobby': { plans: [ { name:'Hobby ($5 credit)',cpu:2,ram:2,pricePerMonth:5,note:'$5/mo free credit'} ] },
            'Pro':   { plans: [ { name:'Pro 1vCPU/2GB',cpu:1,ram:2,pricePerMonth:20}, { name:'Pro 2vCPU/4GB',cpu:2,ram:4,pricePerMonth:35}, { name:'Pro 4vCPU/8GB',cpu:4,ram:8,pricePerMonth:65}, { name:'Pro 8vCPU/16GB',cpu:8,ram:16,pricePerMonth:125}, { name:'Pro 16vCPU/32GB',cpu:16,ram:32,pricePerMonth:240} ] },
          },
          billingModel: 'fixed',
          extraCosts: { cpuPerVCPUHr: 0.000463, ramPerGBHr: 0.000231, networkPerGB: 0.10 },
        },
      },
      Database: {
        PostgreSQL: {
          label: 'Railway PostgreSQL',
          types: {
            'PostgreSQL': { plans: [ { name:'Hobby DB',cpu:1,ram:1,storage:1,pricePerMonth:5}, { name:'Pro S',cpu:1,ram:1,storage:5,pricePerMonth:7}, { name:'Pro M',cpu:2,ram:4,storage:20,pricePerMonth:25}, { name:'Pro L',cpu:4,ram:8,storage:50,pricePerMonth:55} ] },
          },
          billingModel: 'fixed',
          extraCosts: { storagePerGB: 0.25 },
        },
        MySQL: {
          label: 'Railway MySQL',
          types: {
            'MySQL': { plans: [ { name:'Hobby DB',cpu:1,ram:1,storage:1,pricePerMonth:5}, { name:'Pro S',cpu:1,ram:1,storage:5,pricePerMonth:7}, { name:'Pro M',cpu:2,ram:4,storage:20,pricePerMonth:25} ] },
          },
          billingModel: 'fixed',
        },
        Redis: {
          label: 'Railway Redis',
          types: {
            'Redis': { plans: [ { name:'Redis S',cpu:1,ram:0.5,storage:0,pricePerMonth:5}, { name:'Redis M',cpu:1,ram:1,storage:0,pricePerMonth:10} ] },
          },
          billingModel: 'fixed',
        },
      },
      Storage: {
        'Volumes': {
          label: 'Persistent Volumes',
          types: { 'SSD': { pricePerGB: 0.25 } },
          billingModel: 'per_gb',
        },
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // VERCEL
  // ══════════════════════════════════════════════════════════════════
  vercel: {
    id: 'vercel', name: 'Vercel', shortName: 'Vercel',
    color: '#000000', bgColor: '#F0F0F0',
    region: 'Global (Edge)', currency: 'USD', lastVerified: '2024-01',
    sourceUrl: 'https://vercel.com/pricing',
    categories: {
      Compute: {
        'Deployments': {
          label: 'Vercel Deployments',
          types: {
            'Hobby (Free)':  { plans: [ { name:'Hobby',pricePerMonth:0,note:'Personal use, 100GB bandwidth'} ] },
            'Pro':           { plans: [ { name:'Pro',pricePerMonth:20,note:'Teams, 1TB bandwidth'} ] },
            'Enterprise':    { plans: [ { name:'Enterprise',pricePerMonth:400,note:'Custom SLA'} ] },
          },
          billingModel: 'fixed',
          extraCosts: { bandwidthFree: 100, bandwidthPerGB: 0.15, functionInvocationsPerMillion: 0.60 },
        },
      },
      Serverless: {
        'Edge Functions': {
          label: 'Edge Functions',
          types: { 'Edge': { includedRequests: 1000000, overagePerMillion: 0.65, pricePerMonth: 0 } },
          billingModel: 'per_million',
        },
        'Serverless Functions': {
          label: 'Serverless Functions',
          types: {
            'Hobby': { includedInvocations: 100000, overagePerMillion: 0, maxDuration: 10 },
            'Pro':   { includedInvocations: 1000000, overagePerMillion: 0.60, maxDuration: 60 },
          },
          billingModel: 'per_million',
        },
      },
      Database: {
        'Vercel Postgres': {
          label: 'Vercel Postgres (Neon)',
          types: {
            'Hobby': { plans: [ { name:'Free',pricePerMonth:0,storage:0.5,connections:100} ] },
            'Pro':   { plans: [ { name:'Pro',pricePerMonth:20,storage:10,connections:1000} ] },
          },
          billingModel: 'fixed',
          extraCosts: { storagePerGB: 0.30 },
        },
        'Vercel KV': {
          label: 'Vercel KV (Upstash Redis)',
          types: {
            'Free': { plans: [ { name:'Free',pricePerMonth:0,storage:0.025,note:'30K req/day'} ] },
            'Pro':  { plans: [ { name:'Pro',pricePerMonth:10,storage:10,note:'Unlimited req'} ] },
          },
          billingModel: 'fixed',
        },
      },
      Storage: {
        'Vercel Blob': {
          label: 'Vercel Blob Storage',
          types: {
            'Hobby': { pricePerGB: 0.02, included: 0.5 },
            'Pro':   { pricePerGB: 0.02, included: 5   },
          },
          billingModel: 'per_gb',
        },
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // NETLIFY
  // ══════════════════════════════════════════════════════════════════
  netlify: {
    id: 'netlify', name: 'Netlify', shortName: 'Netlify',
    color: '#00C7B7', bgColor: '#E5FDFB',
    region: 'Global (CDN)', currency: 'USD', lastVerified: '2024-01',
    sourceUrl: 'https://www.netlify.com/pricing/',
    categories: {
      Compute: {
        'Sites': {
          label: 'Netlify Sites',
          types: {
            'Starter (Free)':  { plans: [ { name:'Free',pricePerMonth:0,buildMinutes:300,bandwidth:100,note:'1 member'} ] },
            'Pro':             { plans: [ { name:'Pro',pricePerMonth:19,buildMinutes:1000,bandwidth:400,note:'3 members'} ] },
            'Business':        { plans: [ { name:'Business',pricePerMonth:99,buildMinutes:3000,bandwidth:600,note:'SSO'} ] },
            'Enterprise':      { plans: [ { name:'Enterprise',pricePerMonth:299,buildMinutes:5000,bandwidth:1500,note:'Priority'} ] },
          },
          billingModel: 'fixed',
          extraCosts: { buildMinutesPer500: 7, bandwidthPerGB: 0.20 },
        },
      },
      Serverless: {
        'Functions': {
          label: 'Netlify Functions',
          types: {
            'Starter': { includedInvocations: 125000, overagePerMillion: 25, maxDuration: 10 },
            'Pro':     { includedInvocations: 500000, overagePerMillion: 25, maxDuration: 26 },
          },
          billingModel: 'per_million',
        },
        'Edge Functions': {
          label: 'Netlify Edge Functions',
          types: {
            'All Plans': { includedInvocations: 1000000, overagePerMillion: 2 },
          },
          billingModel: 'per_million',
        },
      },
      Database: {
        'Forms': {
          label: 'Netlify Forms',
          types: {
            'Starter': { submissions: 100, overagePer1000: 19, pricePerMonth: 0 },
            'Pro':     { submissions: 1000, overagePer1000: 19, pricePerMonth: 0 },
          },
          billingModel: 'fixed',
        },
      },
      Storage: {
        'Large Media': {
          label: 'Large Media Storage',
          types: {
            'Starter': { included: 1, pricePerGB: 0.30 },
            'Pro':     { included: 5, pricePerGB: 0.30 },
          },
          billingModel: 'per_gb',
        },
      },
    },
  },
};
