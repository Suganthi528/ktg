import { useMemo, useState, useCallback } from 'react';
import { calcServiceCost, sumCosts, groupByCategory, newId, inrFmt, usdFmt, HRS_PER_MONTH } from '../utils/serviceCostEngine.js';

/* ═══════════════════════════════════════════════════════════════════════════════
   INLINE SERVICE CATALOG
   Each platform → category → product → { engines?, plans, billingModel, extraCosts }
   All prices: estimates only. Region: primary (us-east-1 / East US / us-central1).
   Last verified: 2024-01. Verify at official provider pricing pages.
═══════════════════════════════════════════════════════════════════════════════ */
const CATALOG = {
  aws: {
    id:'aws', name:'Amazon Web Services', short:'AWS', color:'#FF9900', bg:'#FFF8E6',
    region:'us-east-1', currency:'USD', verified:'2024-01',
    url:'https://aws.amazon.com/pricing/',
    categories: {
      'Compute': {
        icon:'server',
        services: {
          'EC2': {
            label:'EC2 – Elastic Compute Cloud', billingModel:'hourly',
            engines: null,
            types: {
              'General Purpose (t3)': {
                plans:[
                  {name:'t3.micro',  cpu:2,  ram:1,   ph:0.0104},
                  {name:'t3.small',  cpu:2,  ram:2,   ph:0.0208},
                  {name:'t3.medium', cpu:2,  ram:4,   ph:0.0416},
                  {name:'t3.large',  cpu:2,  ram:8,   ph:0.0832},
                  {name:'t3.xlarge', cpu:4,  ram:16,  ph:0.1664},
                  {name:'t3.2xlarge',cpu:8,  ram:32,  ph:0.3328},
                ],
              },
              'General Purpose (m5)': {
                plans:[
                  {name:'m5.large',   cpu:2,  ram:8,   ph:0.096},
                  {name:'m5.xlarge',  cpu:4,  ram:16,  ph:0.192},
                  {name:'m5.2xlarge', cpu:8,  ram:32,  ph:0.384},
                  {name:'m5.4xlarge', cpu:16, ram:64,  ph:0.768},
                ],
              },
              'Compute Optimised (c5)': {
                plans:[
                  {name:'c5.large',   cpu:2,  ram:4,   ph:0.085},
                  {name:'c5.xlarge',  cpu:4,  ram:8,   ph:0.170},
                  {name:'c5.2xlarge', cpu:8,  ram:16,  ph:0.340},
                  {name:'c5.4xlarge', cpu:16, ram:32,  ph:0.680},
                ],
              },
              'Memory Optimised (r5)': {
                plans:[
                  {name:'r5.large',   cpu:2,  ram:16,  ph:0.126},
                  {name:'r5.xlarge',  cpu:4,  ram:32,  ph:0.252},
                  {name:'r5.2xlarge', cpu:8,  ram:64,  ph:0.504},
                  {name:'r5.4xlarge', cpu:16, ram:128, ph:1.008},
                ],
              },
            },
            extras:{ storagePerGB:0.08, bwPerGB:0.09, osSurcharge:{ Windows:0.016, Linux:0 } },
          },
          'Lambda': {
            label:'AWS Lambda – Serverless', billingModel:'serverless',
            engines:null, types:{ 'Serverless Functions':{ plans:[{name:'Lambda',cpu:0,ram:0,ph:0}] } },
            extras:{ reqPer1M:0.20, gbSecPrice:0.0000166667, freeReq:1000000, freeGBSec:400000 },
          },
        },
      },
      'Database': {
        icon:'database',
        services: {
          'RDS': {
            label:'Amazon RDS – Managed Relational DB', billingModel:'hourly',
            engines:['MySQL','PostgreSQL','MariaDB','SQL Server','Oracle'],
            types: {
              MySQL:      { plans:[{name:'db.t3.micro',cpu:2,ram:1,storage:20,ph:0.036},{name:'db.t3.small',cpu:2,ram:2,storage:20,ph:0.072},{name:'db.t3.medium',cpu:2,ram:4,storage:20,ph:0.144},{name:'db.m5.large',cpu:2,ram:8,storage:100,ph:0.258},{name:'db.m5.xlarge',cpu:4,ram:16,storage:200,ph:0.516},{name:'db.m5.2xlarge',cpu:8,ram:32,storage:500,ph:1.032}] },
              PostgreSQL: { plans:[{name:'db.t3.micro',cpu:2,ram:1,storage:20,ph:0.036},{name:'db.t3.small',cpu:2,ram:2,storage:20,ph:0.072},{name:'db.t3.medium',cpu:2,ram:4,storage:20,ph:0.144},{name:'db.m5.large',cpu:2,ram:8,storage:100,ph:0.258},{name:'db.m5.xlarge',cpu:4,ram:16,storage:200,ph:0.516},{name:'db.m5.2xlarge',cpu:8,ram:32,storage:500,ph:1.032}] },
              MariaDB:    { plans:[{name:'db.t3.micro',cpu:2,ram:1,storage:20,ph:0.036},{name:'db.t3.medium',cpu:2,ram:4,storage:20,ph:0.144},{name:'db.m5.large',cpu:2,ram:8,storage:100,ph:0.258}] },
              'SQL Server':{ plans:[{name:'db.t3.small(SE)',cpu:2,ram:2,storage:20,ph:0.200},{name:'db.m5.large(SE)',cpu:2,ram:8,storage:100,ph:0.750},{name:'db.m5.xlarge(SE)',cpu:4,ram:16,storage:200,ph:1.500}] },
              Oracle:     { plans:[{name:'db.t3.small(SE2)',cpu:2,ram:2,storage:20,ph:0.228},{name:'db.m5.large(SE2)',cpu:2,ram:8,storage:100,ph:0.892},{name:'db.m5.xlarge(EE)',cpu:4,ram:16,storage:200,ph:3.500}] },
            },
            extras:{ storagePerGB:0.115, backupPerGB:0.095, multiAZx2:true, dtPerGB:0.09 },
          },
          'Aurora': {
            label:'Amazon Aurora – Cloud-Native DB', billingModel:'hourly',
            engines:['MySQL Compatible','PostgreSQL Compatible'],
            types:{
              'MySQL Compatible':     { plans:[{name:'db.t3.medium',cpu:2,ram:4,storage:10,ph:0.082},{name:'db.r5.large',cpu:2,ram:16,storage:10,ph:0.285},{name:'db.r5.xlarge',cpu:4,ram:32,storage:10,ph:0.570},{name:'db.r5.2xlarge',cpu:8,ram:64,storage:10,ph:1.140}] },
              'PostgreSQL Compatible':{ plans:[{name:'db.t3.medium',cpu:2,ram:4,storage:10,ph:0.082},{name:'db.r5.large',cpu:2,ram:16,storage:10,ph:0.285},{name:'db.r5.xlarge',cpu:4,ram:32,storage:10,ph:0.570}] },
            },
            extras:{ storagePerGB:0.10, backupPerGB:0.021, iopsPerUnit:0.20, dtPerGB:0.08 },
          },
          'DynamoDB': {
            label:'Amazon DynamoDB – NoSQL', billingModel:'serverless',
            engines:['NoSQL (Key-Value / Document)'],
            types:{
              'On-Demand': { plans:[{name:'DynamoDB On-Demand',cpu:0,ram:0,storage:25,ph:0}] },
              'Provisioned':{ plans:[{name:'DynamoDB Provisioned',cpu:0,ram:0,storage:25,ph:0}] },
            },
            extras:{ storagePerGB:0.25, backupPerGB:0.10, readPer1M:0.25, writePer1M:1.25, dtPerGB:0.09 },
          },
          'DocumentDB': {
            label:'Amazon DocumentDB – MongoDB-compatible', billingModel:'hourly',
            engines:['MongoDB compatible'],
            types:{
              'Standard':{ plans:[{name:'db.t3.medium',cpu:2,ram:4,storage:10,ph:0.082},{name:'db.r5.large',cpu:2,ram:16,storage:10,ph:0.277},{name:'db.r5.xlarge',cpu:4,ram:32,storage:10,ph:0.554}] },
            },
            extras:{ storagePerGB:0.10, backupPerGB:0.021, dtPerGB:0.08 },
          },
        },
      },
      'Storage': {
        icon:'archive',
        services: {
          'S3': {
            label:'Amazon S3 – Object Storage', billingModel:'per_gb',
            engines:null,
            types:{
              'Standard':           { pricePerGB:0.023, getP1K:0.0004, putP1K:0.005, minDays:0  },
              'Standard-IA':        { pricePerGB:0.0125,getP1K:0.001,  putP1K:0.01,  minDays:30 },
              'One Zone-IA':        { pricePerGB:0.01,  getP1K:0.001,  putP1K:0.01,  minDays:30 },
              'Glacier Instant':    { pricePerGB:0.004, getP1K:0.01,   putP1K:0.02,  minDays:90 },
              'Glacier Flexible':   { pricePerGB:0.0036,getP1K:0.05,   putP1K:0.05,  minDays:90 },
              'Glacier Deep Archive':{ pricePerGB:0.00099,getP1K:0.10, putP1K:0.10,  minDays:180},
            },
            extras:{ dtPerGB:0.09, dtFree:100 },
          },
          'EBS': {
            label:'Amazon EBS – Block Storage', billingModel:'per_gb',
            engines:null,
            types:{
              'gp3 (General SSD)':  { pricePerGB:0.08,  iopsIncl:3000, iopsPerUnit:0.005 },
              'gp2 (General SSD)':  { pricePerGB:0.10,  iopsIncl:0,    iopsPerUnit:0     },
              'io2 (Provisioned)':  { pricePerGB:0.125, iopsIncl:0,    iopsPerUnit:0.065 },
              'st1 (Throughput HDD)':{ pricePerGB:0.045,iopsIncl:0,    iopsPerUnit:0     },
              'sc1 (Cold HDD)':     { pricePerGB:0.025, iopsIncl:0,    iopsPerUnit:0     },
            },
            extras:{},
          },
        },
      },
      'Networking': {
        icon:'globe',
        services: {
          'ALB': { label:'Application Load Balancer', billingModel:'hourly', engines:null, types:{ 'ALB':{ plans:[{name:'ALB',cpu:0,ram:0,ph:0.008}] } }, extras:{ lcuPerHr:0.008 } },
          'CloudFront': { label:'CloudFront CDN', billingModel:'per_gb', engines:null, types:{ 'CDN':{ pricePerGB:0.0085, inclGB:1024 } }, extras:{ dtPerGB:0.0085 } },
          'Route 53': { label:'Route 53 DNS', billingModel:'fixed', engines:null, types:{ 'DNS':{ zonePerMo:0.50, queryPer1M:0.40 } }, extras:{} },
        },
      },
      'Serverless': {
        icon:'zap',
        services: {
          'API Gateway': { label:'API Gateway', billingModel:'serverless', engines:null, types:{ 'REST API':{ plans:[{name:'API GW',cpu:0,ram:0,ph:0}] } }, extras:{ reqPer1M:3.50, freeReq:1000000 } },
        },
      },
      'Monitoring': {
        icon:'activity',
        services: {
          'CloudWatch': { label:'Amazon CloudWatch', billingModel:'fixed', engines:null, types:{ 'Monitoring':{ metricPerMo:0.30, logsPerGB:0.50, dashboardPerMo:3.00 } }, extras:{} },
        },
      },
    },
  },

  azure: {
    id:'azure', name:'Microsoft Azure', short:'Azure', color:'#0078D4', bg:'#E6F2FF',
    region:'East US', currency:'USD', verified:'2024-01',
    url:'https://azure.microsoft.com/pricing/',
    categories: {
      'Compute': {
        icon:'server',
        services: {
          'Virtual Machines': {
            label:'Azure Virtual Machines', billingModel:'hourly', engines:null,
            types:{
              'General Purpose (B-series)':{ plans:[{name:'B1s',cpu:1,ram:1,ph:0.0104},{name:'B2s',cpu:2,ram:4,ph:0.0416},{name:'B4ms',cpu:4,ram:16,ph:0.1664}] },
              'General Purpose (D-series)':{ plans:[{name:'D2s_v3',cpu:2,ram:8,ph:0.096},{name:'D4s_v3',cpu:4,ram:16,ph:0.192},{name:'D8s_v3',cpu:8,ram:32,ph:0.384},{name:'D16s_v3',cpu:16,ram:64,ph:0.768}] },
              'Compute Optimised (F-series)':{ plans:[{name:'F2s_v2',cpu:2,ram:4,ph:0.085},{name:'F4s_v2',cpu:4,ram:8,ph:0.170},{name:'F8s_v2',cpu:8,ram:16,ph:0.340}] },
              'Memory Optimised (E-series)':{ plans:[{name:'E2s_v3',cpu:2,ram:16,ph:0.126},{name:'E4s_v3',cpu:4,ram:32,ph:0.252},{name:'E8s_v3',cpu:8,ram:64,ph:0.504}] },
            },
            extras:{ storagePerGB:0.05, bwPerGB:0.087 },
          },
          'Azure Functions': { label:'Azure Functions – Serverless', billingModel:'serverless', engines:null, types:{ 'Consumption Plan':{ plans:[{name:'Functions',cpu:0,ram:0,ph:0}] } }, extras:{ reqPer1M:0.20, gbSecPrice:0.000016, freeReq:1000000 } },
        },
      },
      'Database': {
        icon:'database',
        services: {
          'Azure SQL Database': {
            label:'Azure SQL Database', billingModel:'hourly',
            engines:['SQL Server (General Purpose)','SQL Server (Business Critical)','SQL Server (Serverless)'],
            types:{
              'SQL Server (General Purpose)':{ plans:[{name:'GP 2vCores',cpu:2,ram:10,storage:32,ph:0.256},{name:'GP 4vCores',cpu:4,ram:20,storage:100,ph:0.513},{name:'GP 8vCores',cpu:8,ram:40,storage:200,ph:1.026}] },
              'SQL Server (Business Critical)':{ plans:[{name:'BC 2vCores',cpu:2,ram:10,storage:32,ph:0.769},{name:'BC 4vCores',cpu:4,ram:20,storage:100,ph:1.538}] },
              'SQL Server (Serverless)':{ plans:[{name:'Serverless 1vCore',cpu:1,ram:3,storage:32,ph:0.000145}] },
            },
            extras:{ storagePerGB:0.115, backupPerGB:0.05, dtPerGB:0.087 },
          },
          'Azure DB for PostgreSQL': {
            label:'Azure DB for PostgreSQL – Flexible Server', billingModel:'hourly',
            engines:['PostgreSQL'],
            types:{
              PostgreSQL:{ plans:[{name:'B1ms',cpu:1,ram:2,storage:32,ph:0.021},{name:'D2s_v3',cpu:2,ram:8,storage:128,ph:0.191},{name:'D4s_v3',cpu:4,ram:16,storage:256,ph:0.382},{name:'D8s_v3',cpu:8,ram:32,storage:512,ph:0.763}] },
            },
            extras:{ storagePerGB:0.115, backupPerGB:0.05, dtPerGB:0.087 },
          },
          'Azure DB for MySQL': {
            label:'Azure DB for MySQL – Flexible Server', billingModel:'hourly',
            engines:['MySQL'],
            types:{
              MySQL:{ plans:[{name:'B1ms',cpu:1,ram:2,storage:20,ph:0.021},{name:'D2s_v3',cpu:2,ram:8,storage:128,ph:0.191},{name:'D4s_v3',cpu:4,ram:16,storage:256,ph:0.382}] },
            },
            extras:{ storagePerGB:0.10, backupPerGB:0.05, dtPerGB:0.087 },
          },
          'Cosmos DB': {
            label:'Azure Cosmos DB – NoSQL / Multi-model', billingModel:'serverless',
            engines:['NoSQL (Key-Value)','MongoDB API','Cassandra API','Gremlin (Graph)','Table API'],
            types:{
              'Serverless':  { plans:[{name:'Serverless',cpu:0,ram:0,storage:25,ph:0}] },
              'Provisioned': { plans:[{name:'400 RU/s',cpu:0,ram:0,storage:25,ph:0.032},{name:'1000 RU/s',cpu:0,ram:0,storage:100,ph:0.080}] },
            },
            extras:{ storagePerGB:0.25, backupPerGB:0.10, readPer1M:0.28, writePer1M:1.40 },
          },
        },
      },
      'Storage': {
        icon:'archive',
        services: {
          'Blob Storage': { label:'Azure Blob Storage', billingModel:'per_gb', engines:null, types:{ 'Hot':{ pricePerGB:0.018, writeP1K:0.05, readP1K:0.004 }, 'Cool':{ pricePerGB:0.01, writeP1K:0.10, readP1K:0.01 }, 'Archive':{ pricePerGB:0.00099, writeP1K:0.10, readP1K:5.00 } }, extras:{ dtPerGB:0.087, dtFree:100 } },
          'Azure Files': { label:'Azure Files', billingModel:'per_gb', engines:null, types:{ 'Standard':{ pricePerGB:0.06 }, 'Premium SSD':{ pricePerGB:0.21 } }, extras:{} },
          'Managed Disks': { label:'Azure Managed Disks', billingModel:'fixed', engines:null, types:{ 'P10 (128GB SSD)':{ monthlyPrice:19.71, sizeGB:128 }, 'P20 (512GB SSD)':{ monthlyPrice:73.22, sizeGB:512 }, 'P30 (1TB SSD)':{ monthlyPrice:135.17, sizeGB:1024 }, 'E10 (128GB HDD)':{ monthlyPrice:8.00, sizeGB:128 } }, extras:{} },
        },
      },
      'Networking': {
        icon:'globe',
        services: {
          'Application Gateway': { label:'Azure Application Gateway', billingModel:'hourly', engines:null, types:{ 'WAF v2':{ plans:[{name:'WAF v2',cpu:0,ram:0,ph:0.144}] } }, extras:{ cuPerHr:0.008 } },
          'Azure CDN': { label:'Azure CDN', billingModel:'per_gb', engines:null, types:{ 'CDN':{ pricePerGB:0.081 } }, extras:{} },
        },
      },
    },
  },

  gcp: {
    id:'gcp', name:'Google Cloud Platform', short:'GCP', color:'#4285F4', bg:'#E8F0FE',
    region:'us-central1', currency:'USD', verified:'2024-01',
    url:'https://cloud.google.com/pricing',
    categories: {
      'Compute': {
        icon:'server',
        services: {
          'Compute Engine': {
            label:'Compute Engine VMs', billingModel:'hourly', engines:null,
            types:{
              'General Purpose (E2)':{ plans:[{name:'e2-micro',cpu:2,ram:1,ph:0.0085},{name:'e2-small',cpu:2,ram:2,ph:0.0170},{name:'e2-medium',cpu:2,ram:4,ph:0.0340},{name:'e2-standard-2',cpu:2,ram:8,ph:0.0680},{name:'e2-standard-4',cpu:4,ram:16,ph:0.1360},{name:'e2-standard-8',cpu:8,ram:32,ph:0.2720}] },
              'General Purpose (N2)':{ plans:[{name:'n2-standard-2',cpu:2,ram:8,ph:0.0958},{name:'n2-standard-4',cpu:4,ram:16,ph:0.1917},{name:'n2-standard-8',cpu:8,ram:32,ph:0.3834}] },
              'Compute Optimised (C2)':{ plans:[{name:'c2-standard-4',cpu:4,ram:16,ph:0.2088},{name:'c2-standard-8',cpu:8,ram:32,ph:0.4176}] },
              'Memory Optimised (N2)':{ plans:[{name:'n2-highmem-2',cpu:2,ram:16,ph:0.1310},{name:'n2-highmem-4',cpu:4,ram:32,ph:0.2619},{name:'n2-highmem-8',cpu:8,ram:64,ph:0.5238}] },
            },
            extras:{ storagePerGB:0.04, bwPerGB:0.085 },
          },
          'Cloud Run': { label:'Cloud Run – Serverless Containers', billingModel:'serverless', engines:null, types:{ 'Serverless':{ plans:[{name:'Cloud Run',cpu:0,ram:0,ph:0}] } }, extras:{ reqPer1M:0.40, cpuPerVCPUSec:0.000024, ramPerGBSec:0.0000025, freeReq:2000000 } },
          'Cloud Functions': { label:'Cloud Functions', billingModel:'serverless', engines:null, types:{ 'Gen 1':{ plans:[{name:'Cloud Functions',cpu:0,ram:0,ph:0}] } }, extras:{ reqPer1M:0.40, gbSecPrice:0.0000025, freeReq:2000000 } },
        },
      },
      'Database': {
        icon:'database',
        services: {
          'Cloud SQL': {
            label:'Cloud SQL – Managed Relational DB', billingModel:'hourly',
            engines:['MySQL','PostgreSQL','SQL Server'],
            types:{
              MySQL:      { plans:[{name:'db-f1-micro',cpu:1,ram:0.6,storage:10,ph:0.0107},{name:'db-g1-small',cpu:1,ram:1.7,storage:10,ph:0.0353},{name:'db-n1-standard-1',cpu:1,ram:3.75,storage:10,ph:0.0645},{name:'db-n1-standard-2',cpu:2,ram:7.5,storage:20,ph:0.1291},{name:'db-n1-standard-4',cpu:4,ram:15,storage:50,ph:0.2581},{name:'db-n1-standard-8',cpu:8,ram:30,storage:100,ph:0.5162}] },
              PostgreSQL: { plans:[{name:'db-f1-micro',cpu:1,ram:0.6,storage:10,ph:0.0107},{name:'db-g1-small',cpu:1,ram:1.7,storage:10,ph:0.0353},{name:'db-n1-standard-1',cpu:1,ram:3.75,storage:10,ph:0.0645},{name:'db-n1-standard-2',cpu:2,ram:7.5,storage:20,ph:0.1291},{name:'db-n1-standard-4',cpu:4,ram:15,storage:50,ph:0.2581}] },
              'SQL Server':{ plans:[{name:'db-n1-standard-1',cpu:1,ram:3.75,storage:10,ph:0.280},{name:'db-n1-standard-2',cpu:2,ram:7.5,storage:20,ph:0.560},{name:'db-n1-standard-4',cpu:4,ram:15,storage:50,ph:1.120}] },
            },
            extras:{ storagePerGB:0.17, backupPerGB:0.08, haX2:true, dtPerGB:0.085 },
          },
          'AlloyDB': {
            label:'AlloyDB for PostgreSQL', billingModel:'hourly',
            engines:['PostgreSQL (AlloyDB)'],
            types:{
              'PostgreSQL (AlloyDB)':{ plans:[{name:'2vCPU/16GB',cpu:2,ram:16,storage:10,ph:0.288},{name:'4vCPU/32GB',cpu:4,ram:32,storage:10,ph:0.576},{name:'8vCPU/64GB',cpu:8,ram:64,storage:10,ph:1.152}] },
            },
            extras:{ storagePerGB:0.10, backupPerGB:0.023, dtPerGB:0.08 },
          },
          'Firestore': {
            label:'Cloud Firestore – NoSQL', billingModel:'serverless',
            engines:['NoSQL (Document)'],
            types:{ 'Blaze':{ plans:[{name:'Blaze',cpu:0,ram:0,storage:1,ph:0}] } },
            extras:{ storagePerGB:0.18, readPer1M:0.06, writePer1M:0.18, dtPerGB:0.12 },
          },
          'BigQuery': {
            label:'BigQuery – Data Warehouse', billingModel:'serverless',
            engines:['Columnar (BigQuery)'],
            types:{ 'On-Demand':{ plans:[{name:'BigQuery',cpu:0,ram:0,storage:10,ph:0}] } },
            extras:{ storagePerGB:0.02, queryPerTB:5.00, dtPerGB:0.085 },
          },
        },
      },
      'Storage': {
        icon:'archive',
        services: {
          'Cloud Storage': { label:'Cloud Storage', billingModel:'per_gb', engines:null, types:{ 'Standard':{ pricePerGB:0.020 }, 'Nearline':{ pricePerGB:0.010, minDays:30 }, 'Coldline':{ pricePerGB:0.004, minDays:90 }, 'Archive':{ pricePerGB:0.0012, minDays:365 } }, extras:{ dtPerGB:0.085, dtFree:200 } },
          'Persistent Disk': { label:'Persistent Disk', billingModel:'per_gb', engines:null, types:{ 'Standard HDD':{ pricePerGB:0.04 }, 'SSD':{ pricePerGB:0.17 }, 'Extreme SSD':{ pricePerGB:0.125 } }, extras:{} },
        },
      },
      'Networking': {
        icon:'globe',
        services: {
          'Cloud Load Balancing': { label:'Cloud Load Balancing', billingModel:'hourly', engines:null, types:{ 'Global LB':{ plans:[{name:'Global LB',cpu:0,ram:0,ph:0.025}] } }, extras:{} },
          'Cloud CDN': { label:'Cloud CDN', billingModel:'per_gb', engines:null, types:{ 'CDN':{ pricePerGB:0.08, inclGB:0 } }, extras:{} },
        },
      },
      'Monitoring': {
        icon:'activity',
        services: {
          'Cloud Monitoring': { label:'Cloud Monitoring', billingModel:'per_gb', engines:null, types:{ 'Monitoring':{ pricePerGB:0.01, inclMB:50000 } }, extras:{} },
        },
      },
    },
  },

  digitalocean: {
    id:'digitalocean', name:'DigitalOcean', short:'DO', color:'#0080FF', bg:'#E5F2FF',
    region:'NYC3', currency:'USD', verified:'2024-01',
    url:'https://www.digitalocean.com/pricing/',
    categories: {
      'Compute': {
        icon:'server',
        services: {
          'Droplets': {
            label:'Droplets – VPS', billingModel:'fixed', engines:null,
            types:{
              'Basic':   { plans:[{name:'Basic 1GB',cpu:1,ram:1,storage:25,bw:1000,pm:6},{name:'Basic 2GB',cpu:1,ram:2,storage:50,bw:2000,pm:12},{name:'Basic 4GB',cpu:2,ram:4,storage:80,bw:4000,pm:24},{name:'Basic 8GB',cpu:4,ram:8,storage:160,bw:5000,pm:48}] },
              'General': { plans:[{name:'General 8GB',cpu:2,ram:8,storage:25,bw:4000,pm:63},{name:'General 16GB',cpu:4,ram:16,storage:50,bw:5000,pm:126},{name:'General 32GB',cpu:8,ram:32,storage:100,bw:6000,pm:252}] },
              'CPU-Optimised':{ plans:[{name:'CPU-Opt 4GB',cpu:2,ram:4,storage:25,bw:4000,pm:42},{name:'CPU-Opt 8GB',cpu:4,ram:8,storage:50,bw:5000,pm:84}] },
            },
            extras:{ bwOveragePerGB:0.01 },
          },
          'App Platform': { label:'App Platform – PaaS', billingModel:'fixed', engines:null, types:{ 'Starter':{ plans:[{name:'Basic',cpu:1,ram:0.5,pm:5},{name:'Professional',cpu:1,ram:2,pm:12}] } }, extras:{} },
          'Kubernetes': { label:'Managed Kubernetes', billingModel:'fixed', engines:null, types:{ 'Worker Node':{ plans:[{name:'s-1vcpu-2gb',cpu:1,ram:2,pm:12},{name:'s-2vcpu-4gb',cpu:2,ram:4,pm:24},{name:'s-4vcpu-8gb',cpu:4,ram:8,pm:48}] } }, extras:{ clusterMgmtFree:true } },
        },
      },
      'Database': {
        icon:'database',
        services: {
          'Managed MySQL': { label:'Managed MySQL', billingModel:'fixed', engines:['MySQL'], types:{ MySQL:{ plans:[{name:'DB 1GB',cpu:1,ram:1,storage:10,pm:15},{name:'DB 2GB',cpu:1,ram:2,storage:25,pm:30},{name:'DB 4GB',cpu:2,ram:4,storage:38,pm:60},{name:'DB 8GB',cpu:2,ram:8,storage:115,pm:120},{name:'DB 16GB',cpu:4,ram:16,storage:270,pm:240}] } }, extras:{ storageOverPerGB:0.10, backupPerGB:0.023, haX2:true } },
          'Managed PostgreSQL': { label:'Managed PostgreSQL', billingModel:'fixed', engines:['PostgreSQL'], types:{ PostgreSQL:{ plans:[{name:'DB 1GB',cpu:1,ram:1,storage:10,pm:15},{name:'DB 2GB',cpu:1,ram:2,storage:25,pm:30},{name:'DB 4GB',cpu:2,ram:4,storage:38,pm:60},{name:'DB 8GB',cpu:2,ram:8,storage:115,pm:120},{name:'DB 16GB',cpu:4,ram:16,storage:270,pm:240},{name:'DB 32GB',cpu:8,ram:32,storage:580,pm:480}] } }, extras:{ storageOverPerGB:0.10, backupPerGB:0.023, haX2:true } },
          'Managed MongoDB': { label:'Managed MongoDB', billingModel:'fixed', engines:['MongoDB'], types:{ MongoDB:{ plans:[{name:'DB 2GB',cpu:1,ram:2,storage:25,pm:30},{name:'DB 4GB',cpu:2,ram:4,storage:38,pm:60},{name:'DB 8GB',cpu:2,ram:8,storage:115,pm:120}] } }, extras:{ storageOverPerGB:0.10, backupPerGB:0.023 } },
          'Managed Redis': { label:'Managed Redis / KeyValue', billingModel:'fixed', engines:['Redis'], types:{ Redis:{ plans:[{name:'Cache 1GB',cpu:1,ram:1,storage:0,pm:15},{name:'Cache 2GB',cpu:1,ram:2,storage:0,pm:30}] } }, extras:{} },
        },
      },
      'Storage': {
        icon:'archive',
        services: {
          'Spaces': { label:'Spaces – Object Storage', billingModel:'fixed', engines:null, types:{ 'Spaces':{ basePrice:5, inclStorage:250, inclBW:1024, extraStorPerGB:0.02, extraBWPerGB:0.01 } }, extras:{} },
          'Block Storage': { label:'Block Storage Volumes', billingModel:'per_gb', engines:null, types:{ 'SSD Volume':{ pricePerGB:0.10 } }, extras:{} },
        },
      },
      'Networking': {
        icon:'globe',
        services: {
          'Load Balancers': { label:'Load Balancers', billingModel:'fixed', engines:null, types:{ 'LB':{ plans:[{name:'Load Balancer',cpu:0,ram:0,pm:12}] } }, extras:{ bwOveragePerGB:0.01 } },
        },
      },
    },
  },

  render: {
    id:'render', name:'Render', short:'Render', color:'#46E3B7', bg:'#E5FDF7',
    region:'Global', currency:'USD', verified:'2024-01',
    url:'https://render.com/pricing',
    categories: {
      'Application Hosting': {
        icon:'cloud',
        services: {
          'Web Services': { label:'Web Services', billingModel:'fixed', engines:null, types:{ 'Shared':{ plans:[{name:'Free',cpu:0.1,ram:0.25,pm:0,note:'Spins down'},{name:'Starter',cpu:0.5,ram:0.5,pm:7},{name:'Standard',cpu:1,ram:2,pm:25},{name:'Pro',cpu:2,ram:4,pm:85},{name:'Pro Plus',cpu:4,ram:8,pm:175},{name:'Pro Max',cpu:4,ram:16,pm:225},{name:'Pro Ultra',cpu:8,ram:32,pm:450}] } }, extras:{ bwFree:100 } },
          'Background Workers': { label:'Background Workers', billingModel:'fixed', engines:null, types:{ 'Worker':{ plans:[{name:'Starter',cpu:0.5,ram:0.5,pm:7},{name:'Standard',cpu:1,ram:2,pm:25},{name:'Pro',cpu:2,ram:4,pm:85}] } }, extras:{} },
          'Static Sites': { label:'Static Sites', billingModel:'fixed', engines:null, types:{ 'Static':{ plans:[{name:'Free Static',cpu:0,ram:0,pm:0,note:'Always free'}] } }, extras:{} },
        },
      },
      'Database': {
        icon:'database',
        services: {
          'PostgreSQL': { label:'Render PostgreSQL', billingModel:'fixed', engines:['PostgreSQL'], types:{ PostgreSQL:{ plans:[{name:'Free (90d)',cpu:0.1,ram:0.25,storage:1,pm:0,note:'90-day trial'},{name:'Starter',cpu:1,ram:1,storage:10,pm:7},{name:'Standard',cpu:1,ram:4,storage:50,pm:20},{name:'Pro',cpu:2,ram:8,storage:100,pm:50},{name:'Pro Plus',cpu:4,ram:16,storage:256,pm:130}] } }, extras:{ storageOverPerGB:0.30 } },
          'Key Value (Redis)': { label:'Key Value Store (Redis)', billingModel:'fixed', engines:['Redis'], types:{ Redis:{ plans:[{name:'Free',pm:0,storage:25,note:'25MB'},{name:'Starter',pm:10,storage:1024},{name:'Standard',pm:30,storage:5120}] } }, extras:{} },
        },
      },
      'Storage': {
        icon:'archive',
        services: {
          'Persistent Disk': { label:'Persistent Disks', billingModel:'per_gb', engines:null, types:{ 'SSD':{ pricePerGB:0.25 } }, extras:{} },
        },
      },
    },
  },

  railway: {
    id:'railway', name:'Railway', short:'Railway', color:'#B44FEA', bg:'#F5E8FD',
    region:'Global', currency:'USD', verified:'2024-01',
    url:'https://railway.app/pricing',
    categories: {
      'Compute': {
        icon:'server',
        services: {
          'Services': { label:'Railway Compute Services', billingModel:'fixed', engines:null, types:{ 'Hobby':{ plans:[{name:'Hobby ($5/mo)',cpu:2,ram:2,pm:5,note:'$5 credit included'}] }, 'Pro':{ plans:[{name:'Pro 1vCPU/2GB',cpu:1,ram:2,pm:20},{name:'Pro 2vCPU/4GB',cpu:2,ram:4,pm:35},{name:'Pro 4vCPU/8GB',cpu:4,ram:8,pm:65},{name:'Pro 8vCPU/16GB',cpu:8,ram:16,pm:125},{name:'Pro 16vCPU/32GB',cpu:16,ram:32,pm:240}] } }, extras:{ networkPerGB:0.10 } },
        },
      },
      'Database': {
        icon:'database',
        services: {
          'PostgreSQL': { label:'Railway PostgreSQL', billingModel:'fixed', engines:['PostgreSQL'], types:{ PostgreSQL:{ plans:[{name:'Hobby DB',cpu:1,ram:1,storage:1,pm:5},{name:'Pro S',cpu:1,ram:1,storage:5,pm:7},{name:'Pro M',cpu:2,ram:4,storage:20,pm:25},{name:'Pro L',cpu:4,ram:8,storage:50,pm:55}] } }, extras:{ storagePerGB:0.25 } },
          'MySQL': { label:'Railway MySQL', billingModel:'fixed', engines:['MySQL'], types:{ MySQL:{ plans:[{name:'Hobby DB',cpu:1,ram:1,storage:1,pm:5},{name:'Pro S',cpu:1,ram:1,storage:5,pm:7},{name:'Pro M',cpu:2,ram:4,storage:20,pm:25}] } }, extras:{ storagePerGB:0.25 } },
          'Redis': { label:'Railway Redis', billingModel:'fixed', engines:['Redis'], types:{ Redis:{ plans:[{name:'Redis S',cpu:1,ram:0.5,storage:0,pm:5},{name:'Redis M',cpu:1,ram:1,storage:0,pm:10}] } }, extras:{} },
          'MongoDB': { label:'Railway MongoDB', billingModel:'fixed', engines:['MongoDB'], types:{ MongoDB:{ plans:[{name:'Hobby DB',cpu:1,ram:1,storage:1,pm:5},{name:'Pro M',cpu:2,ram:4,storage:20,pm:25}] } }, extras:{} },
        },
      },
      'Storage': {
        icon:'archive',
        services: {
          'Volumes': { label:'Persistent Volumes', billingModel:'per_gb', engines:null, types:{ 'SSD':{ pricePerGB:0.25 } }, extras:{} },
        },
      },
      'Networking': {
        icon:'globe',
        services: {
          'Networking': { label:'Network Egress', billingModel:'per_gb', engines:null, types:{ 'Egress':{ pricePerGB:0.10 } }, extras:{} },
        },
      },
    },
  },

  vercel: {
    id:'vercel', name:'Vercel', short:'Vercel', color:'#171717', bg:'#F0F0F0',
    region:'Global (Edge)', currency:'USD', verified:'2024-01',
    url:'https://vercel.com/pricing',
    categories: {
      'Application Hosting': {
        icon:'cloud',
        services: {
          'Frontend Hosting': { label:'Frontend / JAMstack Hosting', billingModel:'fixed', engines:null, types:{ 'Hobby':{ plans:[{name:'Free',pm:0,bw:100,note:'Personal only'}] }, 'Pro':{ plans:[{name:'Pro',pm:20,bw:1024}] }, 'Enterprise':{ plans:[{name:'Enterprise',pm:400,bw:9999}] } }, extras:{ bwOverPerGB:0.15 } },
        },
      },
      'Serverless': {
        icon:'zap',
        services: {
          'Serverless Functions': { label:'Serverless Functions', billingModel:'serverless', engines:null, types:{ 'Hobby':{ plans:[{name:'Hobby Fn',cpu:0,ram:0,pm:0}] }, 'Pro':{ plans:[{name:'Pro Fn',cpu:0,ram:0,pm:0}] } }, extras:{ reqPer1M:0.60, freeReq:1000000 } },
          'Edge Functions': { label:'Edge Functions', billingModel:'serverless', engines:null, types:{ 'Edge':{ plans:[{name:'Edge Fn',cpu:0,ram:0,pm:0}] } }, extras:{ reqPer1M:0.65, freeReq:1000000 } },
        },
      },
      'Database': {
        icon:'database',
        services: {
          'Vercel Postgres': { label:'Vercel Postgres (Neon)', billingModel:'fixed', engines:['PostgreSQL'], types:{ PostgreSQL:{ plans:[{name:'Free',pm:0,storage:0.5,connections:100},{name:'Pro',pm:20,storage:10,connections:1000}] } }, extras:{ storagePerGB:0.30 } },
          'Vercel KV': { label:'Vercel KV (Upstash Redis)', billingModel:'fixed', engines:['Redis'], types:{ Redis:{ plans:[{name:'Free',pm:0,storage:0.025,note:'30K req/day'},{name:'Pro',pm:10,storage:10}] } }, extras:{} },
        },
      },
      'Storage': {
        icon:'archive',
        services: {
          'Vercel Blob': { label:'Vercel Blob Storage', billingModel:'per_gb', engines:null, types:{ 'Blob':{ pricePerGB:0.02, freeGB:0.5 } }, extras:{} },
        },
      },
    },
  },

  netlify: {
    id:'netlify', name:'Netlify', short:'Netlify', color:'#00C7B7', bg:'#E5FDFB',
    region:'Global CDN', currency:'USD', verified:'2024-01',
    url:'https://www.netlify.com/pricing/',
    categories: {
      'Application Hosting': {
        icon:'cloud',
        services: {
          'Static Hosting': { label:'Static Site Hosting', billingModel:'fixed', engines:null, types:{ 'Starter':{ plans:[{name:'Free',pm:0,bw:100,buildMins:300}] }, 'Pro':{ plans:[{name:'Pro',pm:19,bw:400,buildMins:1000}] }, 'Business':{ plans:[{name:'Business',pm:99,bw:600,buildMins:3000}] } }, extras:{ bwOverPerGB:0.20, buildMinsPer500:7 } },
        },
      },
      'Serverless': {
        icon:'zap',
        services: {
          'Functions': { label:'Netlify Functions', billingModel:'serverless', engines:null, types:{ 'Starter':{ plans:[{name:'Functions',cpu:0,ram:0,pm:0}] } }, extras:{ reqPer1M:25, freeReq:125000 } },
          'Edge Functions': { label:'Edge Functions', billingModel:'serverless', engines:null, types:{ 'Edge':{ plans:[{name:'Edge',cpu:0,ram:0,pm:0}] } }, extras:{ reqPer1M:2, freeReq:1000000 } },
        },
      },
      'Database': {
        icon:'database',
        services: {
          'Forms': { label:'Netlify Forms (data capture)', billingModel:'fixed', engines:null, types:{ 'Starter':{ plans:[{name:'Free',pm:0,submissions:100}] }, 'Pro':{ plans:[{name:'Pro',pm:0,submissions:1000}] } }, extras:{ submOvPer1K:19 } },
        },
      },
      'Storage': {
        icon:'archive',
        services: {
          'Large Media': { label:'Large Media / Assets', billingModel:'per_gb', engines:null, types:{ 'Starter':{ pricePerGB:0.30, freeGB:1 }, 'Pro':{ pricePerGB:0.30, freeGB:5 } }, extras:{} },
        },
      },
    },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════════
   COST ENGINE
═══════════════════════════════════════════════════════════════════════════════ */
const USD_TO_INR = 93;
const HRS = 730;

function computeCost(svc, typeKey, typeConf, plan, cfg) {
  const qty     = Math.max(1, +cfg.instances || 1);
  const hours   = Math.max(0, +cfg.usageHours || HRS);
  const storGB  = Math.max(0, +cfg.storageGB  || 0);
  const bwGB    = Math.max(0, +cfg.bandwidthGB|| 0);
  const iops    = Math.max(0, +cfg.iops       || 0);
  const backGB  = Math.max(0, +cfg.backupGB   || 0);
  const reqs    = Math.max(0, +cfg.requests   || 0);
  const reads   = Math.max(0, +cfg.readOps    || 0);
  const writes  = Math.max(0, +cfg.writeOps   || 0);
  const ex      = svc.extras || {};

  let compute=0, storage=0, bandwidth=0, request=0, iosCost=0, backup=0, other=0;

  const model = svc.billingModel;

  /* 1. hourly (EC2, VMs, RDS, Cloud SQL) */
  if (model === 'hourly') {
    const ph = plan?.ph || plan?.pricePerHour || 0;
    compute = ph * hours * qty;
    if (cfg.ha && (ex.multiAZx2 || ex.haX2)) compute *= 2;
    if (ex.osSurcharge && cfg.os) compute += (ex.osSurcharge[cfg.os]||0)*hours*qty;
    const inclStor = plan?.storage || 0;
    storage = Math.max(0, storGB - inclStor) * (ex.storagePerGB||0);
    backup  = backGB * (ex.backupPerGB||0);
    bandwidth = Math.max(0, bwGB-(ex.dtFree||0)) * (ex.dtPerGB||ex.bwPerGB||0);
  }

  /* 2. fixed monthly (Droplets, Linode, Render, Railway, DO DB) */
  if (model === 'fixed') {
    const pm = plan?.pm || plan?.pricePerMonth || 0;
    compute = pm * qty;
    if (cfg.ha && ex.haX2) compute *= 2;
    // object-storage style (DO Spaces)
    if (typeConf?.basePrice !== undefined) {
      compute = typeConf.basePrice;
      storage = Math.max(0, storGB - (typeConf.inclStorage||0)) * (typeConf.extraStorPerGB||0);
      bandwidth = Math.max(0, bwGB - (typeConf.inclBW||0)) * (typeConf.extraBWPerGB||0);
    } else {
      const inclStor = plan?.storage || 0;
      storage = Math.max(0, storGB - inclStor) * (ex.storageOverPerGB||ex.storagePerGB||0);
      backup  = backGB * (ex.backupPerGB||0);
      bandwidth = Math.max(0, bwGB - (ex.bwFree||plan?.bw||0)) * (ex.bwOveragePerGB||ex.bwOverPerGB||0);
    }
    // managed disk fixed price
    if (typeConf?.monthlyPrice !== undefined) compute = typeConf.monthlyPrice * qty;
    // form submissions overage
    if (ex.submOvPer1K && cfg.submissions) {
      const inclSub = plan?.submissions || 100;
      other += Math.ceil(Math.max(0, cfg.submissions - inclSub)/1000)*ex.submOvPer1K;
    }
  }

  /* 3. per_gb (S3, EBS, Blob, Cloud Storage) */
  if (model === 'per_gb') {
    const ppg = typeConf?.pricePerGB || 0;
    const free = typeConf?.freeGB || 0;
    compute = Math.max(0, storGB - free) * ppg;
    if (typeConf?.iopsPerUnit && iops > 0) iosCost = iops * typeConf.iopsPerUnit;
    bandwidth = Math.max(0, bwGB - (ex.dtFree||0)) * (ex.dtPerGB||0);
    // per-request (S3 operations)
    if (cfg.requests && typeConf?.getP1K) request = (reqs/1000)*typeConf.getP1K;
  }

  /* 4. serverless (Lambda, DynamoDB, Firestore, API GW, Fn) */
  if (model === 'serverless') {
    // base plan cost
    const pm = plan?.pm || plan?.pricePerMonth || 0;
    compute = pm * qty;
    // request cost
    const rateM = ex.reqPer1M || 0;
    const freeR = ex.freeReq  || 0;
    request = Math.max(0, reqs - freeR) / 1_000_000 * rateM;
    // duration cost (Lambda / Cloud Fn)
    if (ex.gbSecPrice && cfg.memoryMB && cfg.durationMs) {
      const gbSec = (cfg.memoryMB/1024)*(cfg.durationMs/1000)*reqs;
      other += Math.max(0, gbSec - (ex.freeGBSec||0)) * ex.gbSecPrice;
    }
    // Cloud Run cpu/ram billing
    if (ex.cpuPerVCPUSec && cfg.cpu && cfg.durationMs) {
      const secs = (cfg.durationMs/1000)*reqs;
      other += cfg.cpu * ex.cpuPerVCPUSec * secs + (cfg.ram||1)*ex.ramPerGBSec*secs;
    }
    // DynamoDB / Firestore read+write ops
    request += (reads/1_000_000)*(ex.readPer1M||0);
    request += (writes/1_000_000)*(ex.writePer1M||0);
    // storage
    const inclStor = plan?.storage || 0;
    storage = Math.max(0, storGB - inclStor) * (ex.storagePerGB||0);
    bandwidth = Math.max(0, bwGB - (ex.dtFree||0)) * (ex.dtPerGB||0);
  }

  const totalUSD = compute+storage+bandwidth+request+iosCost+backup+other;
  const totalINR = totalUSD * USD_TO_INR;
  const gst      = totalINR * 0.18;
  return {
    compute: +compute.toFixed(2), storage: +storage.toFixed(2),
    bandwidth: +bandwidth.toFixed(2), request: +request.toFixed(2),
    iops: +iosCost.toFixed(2), backup: +backup.toFixed(2), other: +other.toFixed(2),
    totalUSD: +totalUSD.toFixed(2), totalINR: Math.round(totalINR),
    gst: Math.round(gst), totalWithGST: Math.round(totalINR+gst),
    annualINR: Math.round(totalINR*11), annualWithGST: Math.round((totalINR+gst)*11),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════════ */
const inr = (n) => '₹'+Math.round(n||0).toLocaleString('en-IN');
const usd = (n) => '$'+(+(n||0)).toFixed(2);
const uid = () => Math.random().toString(36).slice(2,9);
const pct = (a,b) => b>0 ? Math.min(100,Math.round((a/b)*100)) : 0;

function MBar({used,total,label}) {
  const p=pct(used,total);
  const cls=p>85?'hot':p>65?'warn':'';
  return (
    <div className="cap-meter-wrap">
      <div className="cap-meter-track"><div className={`cap-meter-fill ${cls}`} style={{width:`${p}%`}}/></div>
      <div className="cap-meter-labels"><span>{label}: <b>{used}</b></span><span>Limit: <b>{total}</b></span></div>
    </div>
  );
}

function Pill({p}) {
  const cls=p>85?'cap-status-danger':p>65?'cap-status-warning':'cap-status-success';
  return <span className={`cap-status-pill ${cls}`}>{p}% used</span>;
}

const CAT_COLOR = { Compute:'#2563eb', Database:'#059669', Storage:'#d97706', Networking:'#7c3aed', 'Application Hosting':'#0891b2', Serverless:'#db2777', Monitoring:'#64748b', Backup:'#92400e', CDN:'#065f46' };

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════════ */
const DEFAULT_CFG = { instances:1, usageHours:HRS, storageGB:50, bandwidthGB:100, requests:0, iops:0, readOps:0, writeOps:0, backupGB:20, ha:false, os:'Linux', cpu:1, ram:2, durationMs:500, memoryMB:512, buildMinutes:300, submissions:0 };

export default function ServiceCalculatorTab() {
  /* ── selection ── */
  const [pid,   setPid]   = useState('');
  const [cat,   setCat]   = useState('');
  const [svcKey,setSvc]   = useState('');
  const [engine,setEng]   = useState('');
  const [typeKey,setType] = useState('');
  const [planName,setPlan]= useState('');
  const [cfg,   setCfg]   = useState({...DEFAULT_CFG});
  const [editId,setEdit]  = useState(null);
  const [items, setItems] = useState([]);
  const [activeView, setView] = useState('selector'); // selector | quote | compare
  const [cmpState, setCmp] = useState({ cat:'Database', svcKw:'PostgreSQL', type:'PostgreSQL', cfg:{...DEFAULT_CFG} });

  /* ── derived ── */
  const platform = pid ? CATALOG[pid] : null;
  const cats     = platform ? Object.keys(platform.categories) : [];
  const svcMap   = platform && cat ? platform.categories[cat]?.services || {} : {};
  const services = Object.keys(svcMap);
  const svcDef   = svcMap[svcKey] || null;
  const engines  = svcDef?.engines || null;
  const typeMap  = svcDef?.types   || {};
  // effective typeKey: if engines, typeKey = engine; else typeKey is the selected type
  const effectiveType = engines ? (engine || (Object.keys(typeMap)[0]||'')) : typeKey;
  const typeConf = typeMap[effectiveType] || null;
  const plans    = typeConf?.plans || [];
  const selPlan  = plans.find(p=>p.name===planName) || plans[0] || null;

  const liveCost = useMemo(()=> svcDef && typeConf ? computeCost(svcDef,effectiveType,typeConf,selPlan,cfg) : null, [svcDef,typeConf,selPlan,cfg,effectiveType]);

  /* ── cascade resets ── */
  const onPid   = v => { setPid(v); setCat(''); setSvc(''); setEng(''); setType(''); setPlan(''); };
  const onCat   = v => { setCat(v); setSvc(''); setEng(''); setType(''); setPlan(''); };
  const onSvc   = v => { setSvc(v); setEng(''); setType(''); setPlan('');
    // auto-select first engine / type
    const sd = platform?.categories[cat]?.services[v];
    if (sd?.engines?.length) setEng(sd.engines[0]);
    else { const t=Object.keys(sd?.types||{})[0]; if(t) setType(t); }
  };
  const onEng   = v => { setEng(v); setPlan(''); };
  const onType  = v => { setType(v); setPlan(''); };
  const onPlan  = v => { setPlan(v);
    const p = (typeConf?.plans||[]).find(x=>x.name===v);
    if(p) setCfg(prev=>({ ...prev, cpu:p.cpu||prev.cpu, ram:p.ram||prev.ram }));
  };
  const setF = k => e => {
    const t=e.target, v=t.type==='checkbox'?t.checked:t.type==='number'?(t.value===''?'':Math.max(0,+t.value)):t.value;
    setCfg(p=>({...p,[k]:v}));
  };

  /* ── add / update ── */
  const handleAdd = useCallback(() => {
    if (!svcDef || !liveCost || !platform) return;
    const item = {
      id: editId||uid(),
      pid, platformName:platform.name, platformColor:platform.color,
      category:cat, service:svcKey, engine:engine||typeKey,
      type:effectiveType, planName:selPlan?.name||effectiveType,
      cfg:{...cfg}, cost:liveCost, billingModel:svcDef.billingModel,
    };
    if(editId){ setItems(p=>p.map(x=>x.id===editId?item:x)); setEdit(null); }
    else setItems(p=>[...p,item]);
    setView('quote');
  },[editId,svcDef,liveCost,platform,pid,cat,svcKey,engine,typeKey,effectiveType,selPlan,cfg]);

  const handleEdit = item => {
    setPid(item.pid); setCat(item.category); setSvc(item.service);
    setEng(item.engine); setType(item.type); setPlan(item.planName);
    setCfg({...item.cfg}); setEdit(item.id); setView('selector');
    window.scrollTo({top:0,behavior:'smooth'});
  };
  const handleDup  = item => setItems(p=>[...p,{...item,id:uid()}]);
  const handleDel  = id   => setItems(p=>p.filter(x=>x.id!==id));
  const handleQty  = (id,d)=> setItems(p=>p.map(x=>x.id===id?{...x,cfg:{...x.cfg,instances:Math.max(1,(x.cfg.instances||1)+d)}}:x));

  /* ── totals ── */
  const totals = useMemo(()=>items.reduce((a,i)=>({
    totalUSD:a.totalUSD+(i.cost?.totalUSD||0),
    totalINR:a.totalINR+(i.cost?.totalINR||0),
    gst:a.gst+(i.cost?.gst||0),
    totalWithGST:a.totalWithGST+(i.cost?.totalWithGST||0),
  }),{totalUSD:0,totalINR:0,gst:0,totalWithGST:0}),[items]);

  const grouped = useMemo(()=>items.reduce((a,i)=>{const c=i.category||'Other';if(!a[c])a[c]=[];a[c].push(i);return a;},{}),[items]);

  /* ── comparison ── */
  const cmpRows = useMemo(()=>{
    const rows=[];
    Object.entries(CATALOG).forEach(([pid2,p])=>{
      Object.entries(p.categories).forEach(([catK,catV])=>{
        if(catK!==cmpState.cat) return;
        Object.entries(catV.services||{}).forEach(([sK,sv])=>{
          const tk = cmpState.type;
          const tc = sv.types?.[tk];
          if(!tc) return;
          const pl = tc.plans?.[0]||null;
          const c = computeCost(sv,tk,tc,pl,cmpState.cfg);
          rows.push({ pid:pid2, platform:p.name, color:p.color, bg:p.bg,
            service:`${p.short} ${sK}`, plan:pl?.name||tk,
            cpu:pl?.cpu||cmpState.cfg.cpu, ram:pl?.ram||cmpState.cfg.ram,
            storage:pl?.storage||cmpState.cfg.storageGB, cost:c });
        });
      });
    });
    return rows.sort((a,b)=>a.cost.totalWithGST-b.cost.totalWithGST);
  },[cmpState]);

  /* ── upgrade recommendation ── */
  const upgradeRec = useMemo(()=>{
    if(!svcDef||!selPlan||!plans.length) return null;
    const idx = plans.indexOf(selPlan);
    const next = plans[idx+1]||null;
    const storCapacity = selPlan.storage||999999;
    const cpuCapacity  = selPlan.cpu||999999;
    const ramCapacity  = selPlan.ram||999999;
    const storUsePct   = pct(+cfg.storageGB||0, storCapacity);
    const cpuUsePct    = pct(+cfg.cpu||0, cpuCapacity);
    const ramUsePct    = pct(+cfg.ram||0, ramCapacity);
    const needsUpgrade = storUsePct>=90||cpuUsePct>=90||ramUsePct>=90;
    return { selPlan, next, storUsePct, cpuUsePct, ramUsePct, needsUpgrade };
  },[svcDef,selPlan,plans,cfg]);

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <div>
      {/* ── Top nav ── */}
      <nav className="cap-view-bar" style={{marginBottom:12}}>
        <span className="cap-view-bar-title">Module:</span>
        <div className="cap-view-pills">
          {[['selector','⚙ Configure Service'],['quote',`🛒 Quote (${items.length})`],['compare','⇄ Compare Platforms']].map(([v,l])=>(
            <button key={v} type="button" className={`cap-view-pill ${activeView===v?'active':''}`} onClick={()=>setView(v)}>{l}</button>
          ))}
        </div>
      </nav>

      {/* ═══════════════ VIEW: SERVICE SELECTOR ═══════════════ */}
      {activeView==='selector' && (
        <section className="card cap-card">
          <div className="cap-card-header">
            <div className="cap-card-title-wrap">
              <div className="cap-card-icon cap-icon-linode">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div>
                <h3 className="cap-card-title">Dynamic Service Selection &amp; Pricing Calculator</h3>
                <p className="cap-card-sub">Select platform → category → service → engine/type → plan → configure → add to quote. All prices are estimates.</p>
              </div>
            </div>
            <span className="cap-status-pill cap-status-blue">Est. Only</span>
          </div>

          {/* STEP 1 — Platform */}
          <div className="svc-step-block">
            <div className="svc-step-label">① Platform</div>
            <div className="svc-platform-row">
              {Object.values(CATALOG).map(p=>(
                <button key={p.id} type="button"
                  className={`mc-platform-chip ${pid===p.id?'selected':''}`}
                  style={pid===p.id?{borderColor:p.color,backgroundColor:p.bg,color:p.color,fontWeight:700}:{}}
                  onClick={()=>onPid(p.id)}
                >{p.short}</button>
              ))}
            </div>
          </div>

          {/* STEP 2 — Category */}
          {cats.length>0 && (
            <div className="svc-step-block">
              <div className="svc-step-label">② Service Category</div>
              <div className="svc-category-row">
                {cats.map(c=>(
                  <button key={c} type="button"
                    className={`svc-cat-chip ${cat===c?'active':''}`}
                    style={cat===c?{borderColor:CAT_COLOR[c]||'var(--primary-blue)',background:(CAT_COLOR[c]||'#2563eb')+'18',color:CAT_COLOR[c]||'var(--primary-blue)'}:{}}
                    onClick={()=>onCat(c)}
                  >{c}</button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 — Service */}
          {services.length>0 && (
            <div className="svc-step-block">
              <div className="svc-step-label">③ Service / Product</div>
              <div className="svc-service-grid">
                {services.map(sk=>{
                  const sv=svcMap[sk];
                  return (
                    <button key={sk} type="button"
                      className={`svc-service-card ${svcKey===sk?'selected':''}`}
                      onClick={()=>onSvc(sk)}
                    >
                      <span className="svc-service-name">{sk}</span>
                      <span className="svc-service-label">{sv.label}</span>
                      <span className="svc-service-model">{sv.billingModel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4 — Engine (if DB) */}
          {svcDef && engines && (
            <div className="svc-step-block">
              <div className="svc-step-label">④ Database Engine</div>
              <div className="svc-platform-row">
                {engines.map(e=>(
                  <button key={e} type="button"
                    className={`svc-cat-chip ${engine===e?'active':''}`}
                    onClick={()=>onEng(e)}
                  >{e}</button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4b — Type (if no engines) */}
          {svcDef && !engines && Object.keys(typeMap).length>1 && (
            <div className="svc-step-block">
              <div className="svc-step-label">④ Service Type</div>
              <div className="svc-platform-row">
                {Object.keys(typeMap).map(t=>(
                  <button key={t} type="button"
                    className={`svc-cat-chip ${typeKey===t?'active':''}`}
                    onClick={()=>onType(t)}
                  >{t}</button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5 — Plan */}
          {typeConf && plans.length>0 && (
            <div className="svc-step-block">
              <div className="svc-step-label">⑤ Instance / Plan</div>
              <div className="svc-plan-grid">
                {plans.map(p=>{
                  const cost = computeCost(svcDef,effectiveType,typeConf,p,cfg);
                  const on = selPlan?.name===p.name;
                  return (
                    <button key={p.name} type="button"
                      className={`svc-plan-card ${on?'selected':''}`}
                      onClick={()=>onPlan(p.name)}
                    >
                      <span className="svc-plan-name">{p.name}</span>
                      {p.cpu>0 && <span className="svc-plan-spec">{p.cpu} vCPU · {p.ram}GB RAM</span>}
                      {p.storage>0 && <span className="svc-plan-spec">{p.storage}GB storage</span>}
                      {p.note && <span className="svc-plan-note">{p.note}</span>}
                      <span className="svc-plan-price">{inr(cost.totalWithGST)}/mo</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6 — Resource Config */}
          {typeConf && (
            <div className="svc-step-block">
              <div className="svc-step-label">⑥ Resource Configuration</div>
              <div className="svc-cfg-grid">
                <div className="svc-cfg-field"><label className="field-label">Instances / Qty</label><input type="number" min="1" className="input-box" value={cfg.instances} onChange={setF('instances')}/></div>
                <div className="svc-cfg-field"><label className="field-label">Usage Hours/month</label><input type="number" min="0" max="744" className="input-box" value={cfg.usageHours} onChange={setF('usageHours')}/></div>
                <div className="svc-cfg-field"><label className="field-label">Storage (GB)</label><input type="number" min="0" className="input-box" value={cfg.storageGB} onChange={setF('storageGB')}/></div>
                <div className="svc-cfg-field"><label className="field-label">Bandwidth (GB)</label><input type="number" min="0" className="input-box" value={cfg.bandwidthGB} onChange={setF('bandwidthGB')}/></div>
                <div className="svc-cfg-field"><label className="field-label">Backup Storage (GB)</label><input type="number" min="0" className="input-box" value={cfg.backupGB} onChange={setF('backupGB')}/></div>
                {svcDef.billingModel==='serverless' && <>
                  <div className="svc-cfg-field"><label className="field-label">Requests / Invocations</label><input type="number" min="0" className="input-box" value={cfg.requests} onChange={setF('requests')}/></div>
                  <div className="svc-cfg-field"><label className="field-label">Read Ops / month</label><input type="number" min="0" className="input-box" value={cfg.readOps} onChange={setF('readOps')}/></div>
                  <div className="svc-cfg-field"><label className="field-label">Write Ops / month</label><input type="number" min="0" className="input-box" value={cfg.writeOps} onChange={setF('writeOps')}/></div>
                  {svcDef.extras?.gbSecPrice && <>
                    <div className="svc-cfg-field"><label className="field-label">Avg Duration (ms)</label><input type="number" min="0" className="input-box" value={cfg.durationMs} onChange={setF('durationMs')}/></div>
                    <div className="svc-cfg-field"><label className="field-label">Memory (MB)</label><input type="number" min="128" step="128" className="input-box" value={cfg.memoryMB} onChange={setF('memoryMB')}/></div>
                  </>}
                </>}
                {svcDef.billingModel==='per_gb' && typeConf?.iopsPerUnit!==undefined && (
                  <div className="svc-cfg-field"><label className="field-label">IOPS</label><input type="number" min="0" className="input-box" value={cfg.iops} onChange={setF('iops')}/></div>
                )}
                {svcDef.extras?.osSurcharge && (
                  <div className="svc-cfg-field"><label className="field-label">Operating System</label>
                    <div className="select-wrapper">
                      <select className="select-box" value={cfg.os} onChange={setF('os')}>
                        {Object.keys(svcDef.extras.osSurcharge).map(o=><option key={o}>{o}</option>)}
                      </select><span className="select-arrow">▾</span>
                    </div>
                  </div>
                )}
                {(svcDef.extras?.multiAZx2||svcDef.extras?.haX2) && (
                  <div className="svc-cfg-field">
                    <label className={`module-toggle-card ${cfg.ha?'active':''}`} style={{padding:'7px 10px',marginTop:4}}>
                      <div className="module-info"><div className="module-icon-wrap">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      </div><div><span className="module-title">High Availability / Multi-AZ</span><span className="module-hint">Doubles compute cost</span></div></div>
                      <span className="switch"><input type="checkbox" checked={cfg.ha} onChange={setF('ha')}/><span className="slider"/></span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Live cost preview */}
          {liveCost && selPlan && (
            <div className="svc-step-block">
              <div className="svc-step-label">⑦ Live Cost Breakdown</div>

              {/* KPI row */}
              <div className="svc-kpi-row">
                {[
                  {label:'Compute',     val:usd(liveCost.compute)},
                  {label:'Storage',     val:usd(liveCost.storage)},
                  {label:'Bandwidth',   val:usd(liveCost.bandwidth)},
                  {label:'Requests',    val:usd(liveCost.request)},
                  {label:'IOPS',        val:usd(liveCost.iops)},
                  {label:'Backup',      val:usd(liveCost.backup)},
                  {label:'Other',       val:usd(liveCost.other)},
                ].map(({label,val})=>(
                  <div key={label} className="svc-kpi-pill">
                    <span className="svc-kpi-label">{label}</span>
                    <span className="svc-kpi-val">{val}</span>
                  </div>
                ))}
              </div>

              {/* Detail table */}
              <div className="cap-table-wrapper" style={{marginTop:10}}>
                <table className="how-table cap-table">
                  <thead><tr><th>Component</th><th>Formula</th><th style={{textAlign:'right'}}>USD (Est.)</th><th style={{textAlign:'right'}}>INR (Est.)</th></tr></thead>
                  <tbody>
                    {[
                      ['Compute', liveCost.compute, selPlan ? `${selPlan.name} @ ${usd(selPlan.ph||selPlan.pm||0)}/${svcDef.billingModel==='hourly'?'hr':'mo'} × ${cfg.instances} inst.${cfg.ha?' × 2 (HA)':''}` : '—'],
                      ['Storage Overage', liveCost.storage, `${cfg.storageGB}GB requested, ${selPlan.storage||0}GB included`],
                      ['Bandwidth', liveCost.bandwidth, `${cfg.bandwidthGB}GB`],
                      ['Requests / Ops', liveCost.request, `${(+cfg.requests||0).toLocaleString('en-IN')} requests`],
                      ['IOPS', liveCost.iops, `${cfg.iops||0} IOPS`],
                      ['Backup', liveCost.backup, `${cfg.backupGB}GB backup`],
                      ['Other', liveCost.other, 'Duration / CPU-sec / misc'],
                    ].map(([label,val,formula])=>(
                      <tr key={label} className={val===0?'cap-row-off':''}>
                        <td><b>{label}</b></td>
                        <td className="cap-formula-cell">{formula}</td>
                        <td style={{textAlign:'right'}}>{val>0?usd(val):<span className="cap-tag-off">Included</span>}</td>
                        <td style={{textAlign:'right'}}>{val>0?inr(val*USD_TO_INR):'—'}</td>
                      </tr>
                    ))}
                    <tr className="cap-total-row"><td><b>Total excl. GST</b></td><td/><td style={{textAlign:'right'}}><b>{usd(liveCost.totalUSD)}</b></td><td style={{textAlign:'right'}}><b>{inr(liveCost.totalINR)}</b></td></tr>
                    <tr><td>GST (18%)</td><td/><td style={{textAlign:'right'}}>{usd(liveCost.gst/USD_TO_INR)}</td><td style={{textAlign:'right'}}>{inr(liveCost.gst)}</td></tr>
                    <tr className="cap-total-row cap-highlight-row">
                      <td><b>Monthly Payable</b></td><td/>
                      <td style={{textAlign:'right'}}><b>{usd(liveCost.totalWithGST/USD_TO_INR)}</b></td>
                      <td style={{textAlign:'right'}} className="cap-cell-highlight"><b>{inr(liveCost.totalWithGST)}</b></td>
                    </tr>
                    <tr><td>Annual (11 months)</td><td>1 month free</td><td style={{textAlign:'right'}}>{usd(liveCost.annualWithGST/USD_TO_INR)}</td><td style={{textAlign:'right'}}><b>{inr(liveCost.annualWithGST)}</b></td></tr>
                    <tr><td>Per customer/month</td><td>÷ {+cfg.instances||1} instance(s)</td><td/><td style={{textAlign:'right',color:'var(--text-muted)',fontSize:12}}>{inr(liveCost.totalWithGST/Math.max(1,+cfg.instances))}</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Resource meters */}
              {selPlan?.storage>0 && <div style={{marginTop:12}}>
                <MBar used={`${cfg.storageGB}GB`} total={`${selPlan.storage}GB`} label="Storage"/>
              </div>}
              {selPlan?.cpu>0 && <div style={{marginTop:8}}>
                <MBar used={`${cfg.cpu} vCPU`} total={`${selPlan.cpu} vCPU`} label="CPU"/>
              </div>}
              {selPlan?.ram>0 && <div style={{marginTop:8}}>
                <MBar used={`${cfg.ram}GB`} total={`${selPlan.ram}GB`} label="RAM"/>
              </div>}

              {/* Upgrade recommendation */}
              {upgradeRec?.needsUpgrade && upgradeRec.next && (
                <div className="cap-headroom-banner" style={{marginTop:10,background:'#fff7ed',borderColor:'#fed7aa'}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span style={{color:'#9a3412'}}>
                    <b>Upgrade recommended:</b> current resource usage exceeds 90% capacity.
                    Consider upgrading to <b>{upgradeRec.next.name}</b> ({upgradeRec.next.cpu} vCPU / {upgradeRec.next.ram}GB RAM).
                  </span>
                </div>
              )}
              {upgradeRec && !upgradeRec.needsUpgrade && (
                <div className="cap-headroom-banner" style={{marginTop:10}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>
                    Current plan <b>{upgradeRec.selPlan.name}</b> has sufficient capacity.
                    Storage: {upgradeRec.storUsePct}% used. CPU: {upgradeRec.cpuUsePct}% used. RAM: {upgradeRec.ramUsePct}% used.
                    {upgradeRec.next && <> Next plan: <b>{upgradeRec.next.name}</b>.</>}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Add button */}
          {liveCost && (
            <div style={{marginTop:14,display:'flex',gap:8,alignItems:'center'}}>
              <button type="button" className="svc-add-btn" onClick={handleAdd}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {editId?'Update Service':'Add to Quote'}
              </button>
              {editId && <button type="button" className="svc-cancel-btn" onClick={()=>{setEdit(null);setCfg({...DEFAULT_CFG});}}>Cancel Edit</button>}
              {liveCost && <span style={{fontSize:12,color:'var(--text-muted)'}}>→ Monthly: <b style={{color:'var(--primary-blue)'}}>{inr(liveCost.totalWithGST)}</b></span>}
            </div>
          )}

          {platform && (
            <div className="mc-platform-note" style={{marginTop:12}}>
              ⚠ All prices are estimates. Region: {platform.region} · Currency: {platform.currency} · Last verified: {platform.verified} ·{' '}
              <a href={platform.url} target="_blank" rel="noreferrer" style={{color:'inherit'}}>Verify at official pricing ↗</a>
            </div>
          )}
        </section>
      )}

      {/* ═══════════════ VIEW: QUOTE / BILLING SUMMARY ═══════════════ */}
      {activeView==='quote' && (
        <section className="card cap-card">
          <div className="cap-card-header">
            <div className="cap-card-title-wrap">
              <div className="cap-card-icon cap-icon-price">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div>
                <h3 className="cap-card-title">Service Quotation — Billing Summary</h3>
                <p className="cap-card-sub">{items.length} service{items.length!==1?'s':''} selected. Edit, duplicate or remove any line.</p>
              </div>
            </div>
            <button type="button" className="svc-add-btn" onClick={()=>setView('selector')} style={{fontSize:12,padding:'6px 12px'}}>
              + Add Service
            </button>
          </div>

          {items.length===0 && (
            <div className="mc-no-platform-banner">No services added yet. Go to Configure Service to add items.</div>
          )}

          {Object.entries(grouped).map(([catName,catItems])=>{
            const catTotal = catItems.reduce((s,i)=>s+(i.cost?.totalWithGST||0),0);
            return (
              <div key={catName} style={{marginBottom:16}}>
                <div className="svc-group-header" style={{borderLeft:`3px solid ${CAT_COLOR[catName]||'#2563eb'}`}}>
                  <span style={{color:CAT_COLOR[catName]||'var(--primary-blue)'}}>{catName}</span>
                  <span className="svc-group-total">{inr(catTotal)}/mo</span>
                </div>
                <div className="cap-scroll">
                  <table className="how-table cap-table">
                    <thead>
                      <tr>
                        <th>Platform</th><th>Service</th><th>Engine / Type</th><th>Plan</th>
                        <th>CPU</th><th>RAM</th><th>Storage</th>
                        <th style={{textAlign:'right'}}>Compute (USD)</th>
                        <th style={{textAlign:'right'}}>Monthly (GST)</th>
                        <th style={{textAlign:'right'}}>Annual (11mo)</th>
                        <th>Qty</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catItems.map(item=>(
                        <tr key={item.id}>
                          <td><span style={{fontWeight:600,color:item.platformColor}}>{item.platformName}</span></td>
                          <td style={{fontSize:12}}>{item.service}</td>
                          <td style={{fontSize:12}}>{item.engine||item.type}</td>
                          <td style={{fontSize:12}}><b>{item.planName}</b></td>
                          <td style={{fontSize:12}}>{item.cfg.cpu||'—'}</td>
                          <td style={{fontSize:12}}>{item.cfg.ram?`${item.cfg.ram}GB`:'—'}</td>
                          <td style={{fontSize:12}}>{item.cfg.storageGB?`${item.cfg.storageGB}GB`:'—'}</td>
                          <td style={{textAlign:'right',fontSize:12}}>{usd(item.cost?.compute||0)}</td>
                          <td style={{textAlign:'right'}}><b style={{color:'var(--primary-blue)'}}>{inr(item.cost?.totalWithGST||0)}</b></td>
                          <td style={{textAlign:'right',fontSize:12}}>{inr(item.cost?.annualWithGST||0)}</td>
                          <td>
                            <div className="svc-qty-ctrl">
                              <button type="button" className="svc-qty-btn" onClick={()=>handleQty(item.id,-1)}>−</button>
                              <span style={{fontSize:13,fontWeight:600}}>{item.cfg.instances||1}</span>
                              <button type="button" className="svc-qty-btn" onClick={()=>handleQty(item.id,+1)}>+</button>
                            </div>
                          </td>
                          <td>
                            <div className="svc-action-row">
                              <button type="button" className="svc-act-btn svc-edit-btn"   onClick={()=>handleEdit(item)}  title="Edit">✎</button>
                              <button type="button" className="svc-act-btn svc-dup-btn"    onClick={()=>handleDup(item)}   title="Duplicate">⧉</button>
                              <button type="button" className="svc-act-btn svc-remove-btn" onClick={()=>handleDel(item.id)}title="Remove">✕</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {items.length>0 && (
            <>
              {/* Category totals summary */}
              <div className="cap-table-wrapper" style={{marginTop:6}}>
                <table className="how-table cap-table">
                  <thead><tr><th>Category</th><th style={{textAlign:'right'}}>Monthly (excl. GST)</th><th style={{textAlign:'right'}}>Monthly (incl. GST)</th><th style={{textAlign:'right'}}>Annual (11mo)</th></tr></thead>
                  <tbody>
                    {Object.entries(grouped).map(([catName,catItems])=>{
                      const mo  = catItems.reduce((s,i)=>s+(i.cost?.totalINR||0),0);
                      const gst = catItems.reduce((s,i)=>s+(i.cost?.gst||0),0);
                      const ann = catItems.reduce((s,i)=>s+(i.cost?.annualWithGST||0),0);
                      return (
                        <tr key={catName}>
                          <td><span style={{fontWeight:600,color:CAT_COLOR[catName]||'inherit'}}>{catName}</span></td>
                          <td style={{textAlign:'right'}}>{inr(mo)}</td>
                          <td style={{textAlign:'right'}}>{inr(mo+gst)}</td>
                          <td style={{textAlign:'right'}}>{inr(ann)}</td>
                        </tr>
                      );
                    })}
                    <tr className="cap-total-row"><td><b>Subtotal</b></td><td style={{textAlign:'right'}}><b>{inr(totals.totalINR)}</b></td><td style={{textAlign:'right'}}><b>{inr(totals.totalWithGST)}</b></td><td style={{textAlign:'right'}}><b>{inr(Math.round(totals.totalWithGST*11))}</b></td></tr>
                  </tbody>
                </table>
              </div>

              {/* Grand total box */}
              <div className="svc-grand-total" style={{marginTop:14}}>
                {[
                  ['Total excl. GST',    `${usd(totals.totalUSD)} · ${inr(totals.totalINR)}`],
                  ['GST (18%)',           inr(totals.gst)],
                  ['Monthly Payable',     inr(totals.totalWithGST)],
                  ['Annual (11 months)', inr(Math.round(totals.totalWithGST*11))],
                ].map(([label,val],i)=>(
                  <div key={label} className={`svc-total-row${i===2?' svc-total-highlight':''}`}>
                    <span>{i===2?<b>{label}</b>:label}</span>
                    <span>{i===2?<b>{val}</b>:val}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* ═══════════════ VIEW: COMPARE ═══════════════ */}
      {activeView==='compare' && (
        <section className="card cap-card">
          <div className="cap-card-header">
            <div className="cap-card-title-wrap">
              <div className="cap-card-icon cap-icon-storage">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
                </svg>
              </div>
              <div>
                <h3 className="cap-card-title">Multi-Platform Cost Comparison</h3>
                <p className="cap-card-sub">Compare equivalent services across all 8 providers. All prices are estimates.</p>
              </div>
            </div>
          </div>

          {/* Comparison config */}
          <div className="svc-cfg-grid" style={{marginBottom:14}}>
            <div className="svc-cfg-field">
              <label className="field-label">Category</label>
              <div className="select-wrapper">
                <select className="select-box" value={cmpState.cat} onChange={e=>setCmp(p=>({...p,cat:e.target.value,type:''}))}>
                  {['Compute','Database','Storage','Networking','Application Hosting','Serverless'].map(c=><option key={c}>{c}</option>)}
                </select><span className="select-arrow">▾</span>
              </div>
            </div>
            <div className="svc-cfg-field">
              <label className="field-label">Type / Engine (exact match)</label>
              <input className="input-box" value={cmpState.type} onChange={e=>setCmp(p=>({...p,type:e.target.value}))} placeholder="e.g. PostgreSQL, General Purpose (t3)"/>
            </div>
            <div className="svc-cfg-field"><label className="field-label">Storage (GB)</label><input type="number" min="0" className="input-box" value={cmpState.cfg.storageGB} onChange={e=>setCmp(p=>({...p,cfg:{...p.cfg,storageGB:+e.target.value||0}}))}/></div>
            <div className="svc-cfg-field"><label className="field-label">Bandwidth (GB)</label><input type="number" min="0" className="input-box" value={cmpState.cfg.bandwidthGB} onChange={e=>setCmp(p=>({...p,cfg:{...p.cfg,bandwidthGB:+e.target.value||0}}))}/></div>
            <div className="svc-cfg-field"><label className="field-label">Usage Hours</label><input type="number" min="0" max="744" className="input-box" value={cmpState.cfg.usageHours} onChange={e=>setCmp(p=>({...p,cfg:{...p.cfg,usageHours:+e.target.value||HRS}}))}/></div>
            <div className="svc-cfg-field"><label className="field-label">Backup (GB)</label><input type="number" min="0" className="input-box" value={cmpState.cfg.backupGB} onChange={e=>setCmp(p=>({...p,cfg:{...p.cfg,backupGB:+e.target.value||0}}))}/></div>
          </div>

          {cmpRows.length===0 && (
            <div className="mc-no-platform-banner">No matching services found. Try: Category=Database, Type=PostgreSQL — or Category=Compute, Type=General Purpose (t3).</div>
          )}

          {cmpRows.length>0 && (
            <>
              <div className="mc-compare-legend">
                <span className="mc-legend-item mc-cheapest-bg">Lowest Cost</span>
                <span style={{fontSize:11.5,color:'var(--text-muted)'}}>· Sorted cheapest first · Estimates only</span>
              </div>
              <div className="cap-scroll">
                <table className="how-table cap-table">
                  <thead>
                    <tr>
                      <th>#</th><th>Platform</th><th>Service</th><th>Plan</th>
                      <th>CPU</th><th>RAM</th><th>Storage</th>
                      <th style={{textAlign:'right'}}>Compute (USD)</th>
                      <th style={{textAlign:'right'}}>Monthly (GST)</th>
                      <th style={{textAlign:'right'}}>Annual (11mo)</th>
                      <th>Cost Bar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cmpRows.map((row,i)=>{
                      const maxC = cmpRows[cmpRows.length-1].cost.totalWithGST||1;
                      const bp   = pct(row.cost.totalWithGST, maxC);
                      return (
                        <tr key={`${row.pid}-${row.service}`} className={i===0?'mc-cheapest-row':''}>
                          <td style={{color:'var(--text-muted)',fontSize:12}}>{i===0?'🏆':i+1}</td>
                          <td>
                            <span style={{fontWeight:600,color:row.color}}>{row.platform}</span>
                            {i===0 && <span className="mc-plan-badge mc-cheapest-badge" style={{marginLeft:6}}>Lowest</span>}
                          </td>
                          <td style={{fontSize:12}}>{row.service}</td>
                          <td style={{fontSize:12}}><b>{row.plan}</b></td>
                          <td>{row.cpu>0?row.cpu:'—'}</td>
                          <td>{row.ram>0?`${row.ram}GB`:'—'}</td>
                          <td>{row.storage>0?`${row.storage}GB`:'—'}</td>
                          <td style={{textAlign:'right'}}>{usd(row.cost.compute)}</td>
                          <td style={{textAlign:'right'}}><b>{inr(row.cost.totalWithGST)}</b></td>
                          <td style={{textAlign:'right'}}>{inr(row.cost.annualWithGST)}</td>
                          <td style={{minWidth:90}}>
                            <div className="cap-meter-track" style={{height:8}}>
                              <div className="cap-meter-fill" style={{width:`${bp}%`}}/>
                            </div>
                            <div style={{fontSize:10,color:'var(--text-muted)',marginTop:2}}>{bp}%</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {cmpRows.length>1 && (
                <div className="mc-insights-row" style={{marginTop:14}}>
                  {[
                    {label:'Lowest Cost',  val:cmpRows[0].platform,          sub:inr(cmpRows[0].cost.totalWithGST)+'/mo'},
                    {label:'Highest Cost', val:cmpRows[cmpRows.length-1].platform, sub:inr(cmpRows[cmpRows.length-1].cost.totalWithGST)+'/mo'},
                    {label:'Cost Diff',    val:inr(cmpRows[cmpRows.length-1].cost.totalWithGST-cmpRows[0].cost.totalWithGST), sub:'per month'},
                    {label:'Annual Saving',val:inr(cmpRows[cmpRows.length-1].cost.annualWithGST-cmpRows[0].cost.annualWithGST), sub:'cheapest vs highest'},
                  ].map(({label,val,sub})=>(
                    <div key={label} className="mc-insight-card">
                      <span className="mc-insight-label">{label}</span>
                      <span className="mc-insight-val">{val}</span>
                      <span className="mc-insight-sub">{sub}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
