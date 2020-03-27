import { createSelector } from 'reselect';

import { mapResult } from '../utils';
import { AppState } from '..';

export const getConfig = (state: AppState) => state.config;

export const getProjectId = createSelector(getConfig, result =>
  mapResult(result, config => config.projectId)
);

export const getDatabaseConfig = createSelector(getConfig, result =>
  mapResult(result, config => config.database)
);

export const getFirestoreConfig = createSelector(getConfig, result =>
  mapResult(result, config => config.firestore)
);
