/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createFakeUser } from '../../components/Auth/test_utils';
import { AuthState, AuthUser } from '../../components/Auth/types';
import { createRemoteResult, squashOrDefaut } from '../utils';
import {
  authFetchUsersError,
  authFetchUsersSuccess,
  createUserSuccess,
  deleteUserSuccess,
  nukeUsersSuccess,
  setAllowDuplicateEmailsSuccess,
  setUserDisabledSuccess,
  updateFilter,
  updateUserSuccess,
} from './actions';
import { authReducer } from './reducer';

const displayName = 'pirojok';
const localId = 'pirojok-the-id';

function createFakeState(state: Partial<AuthState>): AuthState {
  return {
    filter: '',
    allowDuplicateEmails: true,
    users: createRemoteResult([]),
    ...state,
  };
}

function createFakeStateWithUsers(users: AuthUser[]) {
  return createFakeState({ users: createRemoteResult(users) });
}

describe('auth reducers', () => {
  describe('user reducers', () => {
    it(`${createUserSuccess} => adds a user`, () => {
      const state = createFakeStateWithUsers([]);
      const payload = createFakeUser({ displayName });

      const user = createFakeUser({
        ...payload,
      });

      const action = createUserSuccess({ user });

      const expected = createFakeStateWithUsers([user]);
      expect(authReducer(state, action)).toEqual(expected);
    });

    it(`${nukeUsersSuccess} => clears the data`, () => {
      const user = createFakeUser({ displayName });
      const user2 = createFakeUser({ displayName: 'pelmeni' });
      const state = createFakeStateWithUsers([user, user2]);
      const action = nukeUsersSuccess();

      const expected = createFakeStateWithUsers([]);
      expect(authReducer(state, action)).toEqual(expected);
    });

    it(`${deleteUserSuccess} => removes the user`, () => {
      const user = createFakeUser({ displayName, localId });
      const user2 = createFakeUser({ displayName: 'pelmeni', localId: 'id2' });
      const state = createFakeStateWithUsers([user, user2]);
      const action = deleteUserSuccess({ localId });

      const expected = createFakeStateWithUsers([user2]);
      expect(authReducer(state, action)).toEqual(expected);
    });

    it(`${updateUserSuccess} => updates the user`, () => {
      const newDisplayName = 'New display name';
      const user = createFakeUser({ displayName, localId });
      const user2 = createFakeUser({ displayName: 'pelmeni', localId: 'id2' });
      const state = createFakeStateWithUsers([user, user2]);
      const action = updateUserSuccess({
        user: createFakeUser({ displayName: newDisplayName, localId }),
      });

      const updatedUser = createFakeUser({
        ...user,
        localId,
        displayName: newDisplayName,
      });

      const expected = createFakeStateWithUsers([updatedUser, user2]);

      expect(authReducer(state, action)).toEqual(expected);
    });

    describe(`${setUserDisabledSuccess}`, () => {
      it(`${setUserDisabledSuccess} => disabled the user`, () => {
        const user = createFakeUser({ displayName, localId });
        const state = createFakeStateWithUsers([user]);
        const action = setUserDisabledSuccess({ localId, disabled: true });

        const result = authReducer(state, action);
        expect(squashOrDefaut(result.users, [])[0].disabled).toEqual(true);
      });

      it(`${setUserDisabledSuccess} => enables the user`, () => {
        const user = createFakeUser({ displayName, localId });
        const state = createFakeStateWithUsers([user]);
        const action = setUserDisabledSuccess({ localId, disabled: false });

        const result = authReducer(state, action);
        expect(squashOrDefaut(result.users, [])[0].disabled).toEqual(false);
      });
    });
  });

  describe('filtering', () => {
    it(`${updateFilter} => sets the filter value`, () => {
      const filter = 'filter value';
      const state = createFakeStateWithUsers([]);
      const action = updateFilter({ filter });

      const result = authReducer(state, action);
      expect(result.filter).toEqual(filter);
    });
  });

  describe('config', () => {
    it(`${setAllowDuplicateEmailsSuccess} => sets the filter value`, () => {
      const allowDuplicateEmails = true;
      const state = createFakeState({ allowDuplicateEmails: false });
      const action = setAllowDuplicateEmailsSuccess(allowDuplicateEmails);

      const result = authReducer(state, action);
      expect(result.allowDuplicateEmails).toEqual(allowDuplicateEmails);
    });
  });

  describe('authFetchUsersSuccess', () => {
    it(`${authFetchUsersSuccess} => updates users`, () => {
      const state = createFakeStateWithUsers([]);

      const users: AuthUser[] = [createFakeUser({ localId })];
      const action = authFetchUsersSuccess(users);

      const result = authReducer(state, action);
      expect(result).toEqual(createFakeStateWithUsers(users));
    });
  });

  describe('authFetchUsersError', () => {
    it(`${authFetchUsersError} => sets an error`, () => {
      const state = createFakeStateWithUsers([]);

      const message = 'ayayay!!!';
      const users: AuthUser[] = [createFakeUser({ localId })];
      const action = authFetchUsersError({ message });

      const result = authReducer(state, action);
      expect(result).toEqual(
        createFakeState({
          users: { loading: false, result: { error: { message } } },
        })
      );
    });
  });
});
