import configureStore from 'redux-mock-store';

import { AppState } from '../../store';
import { AuthUser } from './types';

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
