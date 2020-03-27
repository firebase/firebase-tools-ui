import { createSelector } from 'reselect';

import { hasData } from '../utils';
import { AppState } from '..';

export function getDatabases(state: AppState) {
  return state.database.databases;
}

// Get the names of the databases or undefined, if not ready for any reason.
export const getDatabaseNames = createSelector(getDatabases, databases =>
  hasData(databases.result)
    ? databases.result.data.map(db => db.name)
    : undefined
);
