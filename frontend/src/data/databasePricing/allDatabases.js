import { awsDatabase }          from './awsDatabase.js';
import { azureDatabase }        from './azureDatabase.js';
import { gcpDatabase }          from './gcpDatabase.js';
import { digitalOceanDatabase } from './digitalOceanDatabase.js';
import { linodeDatabase }       from './linodeDatabase.js';
import { renderDatabase }       from './renderDatabase.js';
import { railwayDatabase }      from './railwayDatabase.js';
import { vercelDatabase }       from './vercelDatabase.js';
import { netlifyDatabase }      from './netlifyDatabase.js';

export const ALL_DB_PROVIDERS = [
  awsDatabase,
  azureDatabase,
  gcpDatabase,
  digitalOceanDatabase,
  linodeDatabase,
  renderDatabase,
  railwayDatabase,
  vercelDatabase,
  netlifyDatabase,
];

export {
  awsDatabase, azureDatabase, gcpDatabase,
  digitalOceanDatabase, linodeDatabase,
  renderDatabase, railwayDatabase,
  vercelDatabase, netlifyDatabase,
};
