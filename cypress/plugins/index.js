/// <reference types="cypress" />

import { addMatchImageSnapshotPlugin } from 'cypress-image-snapshot/plugin';

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
export default (on, config) => {
  addMatchImageSnapshotPlugin(on, config);
};
