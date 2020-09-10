import { createSelector } from 'reselect';

import { AuthState, AuthUser } from '../../components/Auth/types';
import { getConfigResult } from '../config/selectors';
import { AppState } from '../index';
import { map } from '../utils';

export const getAuth = (state: AppState) => state.auth;
export const getUsers = createSelector(
  getAuth,
  (state: AuthState) => state.users
);

export const hasUsers = createSelector(
  getUsers,
  (users: unknown[]) => users.length > 0
);

export const getFilter = createSelector(
  getAuth,
  (state: AuthState) => state.filter
);

export const getAllowDuplicateEmails = createSelector(
  getAuth,
  (state: AuthState) => state.allowDuplicateEmails
);

export const getFilteredUsers = createSelector(
  getUsers,
  getFilter,
  (users: AuthUser[], filter: string) => {
    if (!filter) {
      return users;
    }
    return users.filter(u => {
      return [u.localId, u.displayName, u.email || '', u.phone || '']
        .join('\n')
        .includes(filter);
    });
  }
);
export const getShowZeroState = createSelector(
  getUsers,
  users => users.length === 0
);
export const getShowZeroResults = createSelector(
  getUsers,
  getFilteredUsers,
  (users, filteredUsers) => users.length > 0 && filteredUsers.length === 0
);
export const getShowTable = createSelector(
  getUsers,
  getFilteredUsers,
  (users, filteredUsers) => filteredUsers.length > 0
);

export const getAuthConfigResult = createSelector(getConfigResult, result =>
  map(result, config => config.auth)
);
