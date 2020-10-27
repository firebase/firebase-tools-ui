import configureStore from 'redux-mock-store';

import { AppState } from '../../store';
import { createRemoteDataLoaded } from '../../store/utils';
import { AuthState, AuthUser } from './types';

export function getMockAuthStore(state?: Partial<AppState>) {
  return configureStore<Pick<AppState, 'auth'>>()({
    auth: {
      users: { loading: false, result: { data: [] } },
      filter: '',
      allowDuplicateEmails: false,
      ...state,
    },
  });
}

export function createFakeUser(user: Partial<AuthUser>): AuthUser {
  return {
    localId: 'pirojok',
    disabled: false,
    displayName: 'Pirojok',
    providerUserInfo: [],
    // September 28 2020
    createdAt: '"1601310006686"',
    lastLoginAt: '"1601310006686"',
    ...user,
  };
}

export function createFakeState(state: Partial<AuthState>): AuthState {
  return {
    filter: '',
    allowDuplicateEmails: true,
    users: createRemoteDataLoaded([]),
    ...state,
  };
}

export function createFakeAuthStateWithUsers(users: AuthUser[]) {
  return createFakeState({ users: createRemoteDataLoaded(users) });
}
