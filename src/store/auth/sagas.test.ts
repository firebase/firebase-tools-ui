import { call, getContext, put, select, setContext } from 'redux-saga/effects';

import AuthApi from '../../components/Auth/api';
import { AddAuthUserPayload, AuthUser } from '../../components/Auth/types';
import { getProjectIdResult } from '../config/selectors';
import {
  authFetchUsersSuccess,
  createUserRequest,
  createUserSuccess,
  deleteUserRequest,
  deleteUserSuccess,
  getAllowDuplicateEmailsRequest,
  nukeUsersSuccess,
  setAllowDuplicateEmailsRequest,
  setAllowDuplicateEmailsSuccess,
  setUserDisabledRequest,
  setUserDisabledSuccess,
  updateUserRequest,
  updateUserSuccess,
} from './actions';
import {
  configureAuthSaga,
  createUser,
  deleteUser,
  fetchAuthUsers,
  getAllowDuplicateEmails,
  nukeUsers,
  setAllowDuplicateEmails,
  setUserDisabled,
  updateUser,
} from './sagas';
import { getAuthConfigResult } from './selectors';

describe('Auth sagas', () => {
  describe('authFetchUsers', () => {
    it('dispatches authFetchUsersSuccess action with the resulting info', () => {
      const gen = fetchAuthUsers();
      const fakeAuthApi = { fetchUsers: jest.fn() };
      const fakeUsers: AuthUser[] = [];
      expect(gen.next()).toEqual({
        done: false,
        value: call(configureAuthSaga),
      });
      expect(gen.next(fakeAuthApi)).toEqual({
        done: false,
        value: call([fakeAuthApi, 'fetchUsers']),
      });
      expect(gen.next(fakeUsers)).toEqual({
        done: false,
        value: put(authFetchUsersSuccess(fakeUsers)),
      });
      expect(gen.next().done).toBe(true);
    });
  });

  describe('createUser', () => {
    it('dispatches createUserSuccess', () => {
      const user = { displayName: 'lol' } as AddAuthUserPayload;
      const fakeAuthApi = { createUser: jest.fn() };
      const gen = createUser(createUserRequest({ user }));
      expect(gen.next()).toEqual({
        done: false,
        value: call(configureAuthSaga),
      });
      expect(gen.next(fakeAuthApi)).toEqual({
        done: false,
        value: call([fakeAuthApi, 'createUser'], user),
      });
      expect(gen.next(user)).toEqual({
        done: false,
        value: put(createUserSuccess({ user })),
      });

      expect(gen.next().done).toBe(true);
    });
  });

  describe('deleteUser', () => {
    it('dispatches deleteUserSuccess action with the resulting info', () => {
      const localId = 'pirojok';
      const fakeAuthApi = { deleteUser: jest.fn() };
      const payload = { localId };
      const gen = deleteUser(deleteUserRequest(payload));
      expect(gen.next()).toEqual({
        done: false,
        value: call(configureAuthSaga),
      });
      expect(gen.next(fakeAuthApi)).toEqual({
        done: false,
        value: call([fakeAuthApi, 'deleteUser'], payload),
      });
      expect(gen.next(payload)).toEqual({
        done: false,
        value: put(deleteUserSuccess(payload)),
      });

      expect(gen.next().done).toBe(true);
    });
  });

  describe('updateUser', () => {
    it('dispatches updateUserSuccess action with the resulting info', () => {
      const localId = 'pirojok';
      const user = { displayName: 'lol' } as AddAuthUserPayload;
      const fakeAuthApi = { updateUser: jest.fn() };
      const newUser = { ...user, localId };
      const gen = updateUser(updateUserRequest({ user, localId }));

      expect(gen.next()).toEqual({
        done: false,
        value: call(configureAuthSaga),
      });
      expect(gen.next(fakeAuthApi)).toEqual({
        done: false,
        value: call([fakeAuthApi, 'updateUser'], newUser),
      });
      expect(gen.next(newUser)).toEqual({
        done: false,
        value: put(updateUserSuccess({ user: newUser })),
      });

      expect(gen.next().done).toBe(true);
    });
  });

  describe('setUserDisabled', () => {
    it('dispatches updateUserSuccess action with the resulting info', () => {
      const localId = 'pirojok';
      const fakeAuthApi = { updateUser: jest.fn() };
      const isDisabled = true;
      const payload = { disabled: isDisabled, localId };
      const gen = setUserDisabled(setUserDisabledRequest(payload));

      expect(gen.next()).toEqual({
        done: false,
        value: call(configureAuthSaga),
      });
      expect(gen.next(fakeAuthApi)).toEqual({
        done: false,
        value: call([fakeAuthApi, 'updateUser'], {
          disableUser: isDisabled,
          localId,
        }),
      });
      expect(gen.next()).toEqual({
        done: false,
        value: put(setUserDisabledSuccess(payload)),
      });

      expect(gen.next().done).toBe(true);
    });
  });

  describe('nukeUsers', () => {
    it('dispatches nukeUsersSuccess action', () => {
      const gen = nukeUsers();
      const fakeAuthApi = { nukeUsers: jest.fn() };

      expect(gen.next()).toEqual({
        done: false,
        value: call(configureAuthSaga),
      });
      expect(gen.next(fakeAuthApi)).toEqual({
        done: false,
        value: call([fakeAuthApi, 'nukeUsers']),
      });
      expect(gen.next()).toEqual({
        done: false,
        value: put(nukeUsersSuccess()),
      });

      expect(gen.next().done).toBe(true);
    });
  });

  describe('setAllowDuplicateEmails', () => {
    it('triggers appropriate API endpoint', () => {
      const fakeAuthApi = { updateConfig: jest.fn() };
      const gen = setAllowDuplicateEmails(setAllowDuplicateEmailsRequest(true));
      expect(gen.next()).toEqual({
        done: false,
        value: call(configureAuthSaga),
      });
      expect(gen.next(fakeAuthApi)).toEqual({
        done: false,
        value: call([fakeAuthApi, 'updateConfig'], true),
      });
      expect(gen.next()).toEqual({
        done: false,
        value: put(setAllowDuplicateEmailsSuccess(true)),
      });
    });
  });

  describe('getAllowDuplicateEmails', () => {
    it('triggers appropriate API endpoint', () => {
      const fakeAuthApi = { getConfig: jest.fn() };
      const gen = getAllowDuplicateEmails(getAllowDuplicateEmailsRequest());
      expect(gen.next()).toEqual({
        done: false,
        value: call(configureAuthSaga),
      });
      expect(gen.next(fakeAuthApi)).toEqual({
        done: false,
        value: call([fakeAuthApi, 'getConfig']),
      });
      expect(gen.next(false)).toEqual({
        done: false,
        value: put(setAllowDuplicateEmailsSuccess(false)),
      });
    });
  });

  describe('configureAuthSaga', () => {
    it('returns api', () => {
      const gen = configureAuthSaga();
      const CONTEXT_KEY = 'authApi';

      expect(gen.next()).toEqual({
        done: false,
        value: getContext(CONTEXT_KEY),
      });
      expect(gen.next()).toEqual({
        done: false,
        value: select(getAuthConfigResult),
      });
      expect(gen.next({ data: { hostAndPort: 'htto://lo.l' } })).toEqual({
        done: false,
        value: select(getProjectIdResult),
      });
      expect(gen.next({ data: 'project' })).toEqual({
        done: false,
        value: setContext({ [CONTEXT_KEY]: jasmine.any(AuthApi) }),
      });

      expect(gen.next().done).toBe(true);
    });

    it('returns existing API if present in the context', () => {
      const gen = configureAuthSaga();
      const CONTEXT_KEY = 'authApi';

      const fakeAuthService = {
        fetchUsers: jest.fn(),
      };
      expect(gen.next()).toEqual({
        done: false,
        value: getContext(CONTEXT_KEY),
      });
      expect(gen.next(fakeAuthService as AuthApi)).toEqual({
        done: true,
        value: fakeAuthService,
      });
    });
  });
});
