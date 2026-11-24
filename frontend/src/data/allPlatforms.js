import { awsPricing } from './awsPricing.js';
import { azurePricing } from './azurePricing.js';
import { gcpPricing } from './gcpPricing.js';
import { digitalOceanPricing } from './digitalOceanPricing.js';
import { linodePricing } from './linodePricing.js';
import { renderPricing } from './renderPricing.js';
import { railwayPricing } from './railwayPricing.js';
import { vercelPricing } from './vercelPricing.js';
import { netlifyPricing } from './netlifyPricing.js';

export const ALL_PLATFORMS = [
  awsPricing,
  azurePricing,
  gcpPricing,
  digitalOceanPricing,
  linodePricing,
  renderPricing,
  railwayPricing,
  vercelPricing,
  netlifyPricing,
];

export {
  awsPricing,
  azurePricing,
  gcpPricing,
  digitalOceanPricing,
  linodePricing,
  renderPricing,
  railwayPricing,
  vercelPricing,
  netlifyPricing,
};
