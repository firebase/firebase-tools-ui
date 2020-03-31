import { createSelector } from 'reselect';

import { map } from '../utils';
import { AppState } from '..';

// Get the RemoteResult wrapper for config. If you only care about result,
// use getConfigResult instead for better caching.
export const getConfig = (state: AppState) => state.config;

export const getConfigResult = (state: AppState) => state.config.result;

// Get whether config is being loaded / refreshed. Note: To check whether config
// is present, use getConfigResult. This only tells whether we're fetching.
export const getConfigLoading = (state: AppState) => state.config.loading;

export const getProjectIdResult = createSelector(getConfigResult, result =>
  map(result, config => config.projectId)
);

export const getDatabaseConfigResult = createSelector(getConfigResult, result =>
  map(result, config => config.database)
);

export const getFirestoreConfigResult = createSelector(
  getConfigResult,
  result => map(result, config => config.firestore)
);
