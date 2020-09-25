import configureStore from 'redux-mock-store';

import { AppState } from '../../store';
import { createRemoteResult } from '../../store/utils';
import { AuthState, AuthUser } from './types';

export function getMockAuthStore() {
  return configureStore<Pick<AppState, 'auth'>>()({
    auth: {
      users: { loading: false, result: { data: [] } },
      filter: '',
      allowDuplicateEmails: false,
    },
  });
}

export function createFakeUser(user: Partial<AuthUser>): AuthUser {
  return {
    localId: 'pirojok',
    disabled: false,
    displayName: 'Pirojok',
    providerUserInfo: [],
    createdAt: '2020-20-20',
    lastLoginAt: '2020-20-20',
    ...user,
  };
}

export function createFakeState(state: Partial<AuthState>): AuthState {
  return {
    filter: '',
    allowDuplicateEmails: true,
    users: createRemoteResult([]),
    ...state,
  };
}

export function createFakeAuthStateWithUsers(users: AuthUser[]) {
  return createFakeState({ users: createRemoteResult(users) });
}
