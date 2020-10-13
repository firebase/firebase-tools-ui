import { createSelector } from 'reselect';

import { AuthState, AuthUser } from '../../components/Auth/types';
import { getConfigResult } from '../config/selectors';
import { AppState } from '../index';
import { hasData, map, squashOrDefaut } from '../utils';

export const getAuth = (state: AppState) => state.auth;

export const getAuthUsers = createSelector(getAuth, (state: AuthState) => {
  return state.users;
});

export const getAuthUserDialog = createSelector(getAuth, (state: AuthState) => {
  return state.authUserDialogData;
});

export const getCurrentEditedUser = createSelector(
  getAuthUserDialog,
  authUserDialogData => {
    return authUserDialogData && hasData(authUserDialogData.result)
      ? authUserDialogData.result.data
      : undefined;
  }
);

export const isEditingUser = createSelector(getCurrentEditedUser, user => {
  return !!user;
});

export const getAuthUsersResult = createSelector(getAuthUsers, users => {
  return users.result;
});

export const getUsers = createSelector(getAuthUsers, users => {
  return [...squashOrDefaut(users, [])].sort(
    (a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt || 0))
  );
});

export const getAllEmails = createSelector(getUsers, users => {
  return new Set(users.map(u => u.email).filter(e => !!e));
});

export const getAllPhoneNumbers = createSelector(getUsers, users => {
  return new Set(users.map(u => u.phoneNumber).filter(e => !!e));
});

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
      return [u.localId, u.displayName, u.email || '', u.phoneNumber || '']
        .join('\n')
        .toLocaleUpperCase()
        .includes(filter.toLocaleUpperCase());
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
