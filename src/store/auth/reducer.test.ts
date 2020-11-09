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

import {
  createFakeAuthStateWithUsers,
  createFakeState,
  createFakeUser,
} from '../../components/Auth/test_utils';
import { AuthUser } from '../../components/Auth/types';
import { squashOrDefaut } from '../utils';
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

describe('auth reducers', () => {
  describe('user reducers', () => {
    it(`${createUserSuccess} => adds a user`, () => {
      const state = createFakeAuthStateWithUsers([]);
      const payload = createFakeUser({ displayName });

      const user = createFakeUser({
        ...payload,
      });

      const action = createUserSuccess({ user });

      const expected = createFakeAuthStateWithUsers([user]);
      expect(authReducer(state, action)).toEqual(expected);
    });

    it(`${nukeUsersSuccess} => clears the data`, () => {
      const user = createFakeUser({ displayName });
      const user2 = createFakeUser({ displayName: 'pelmeni' });
      const state = createFakeAuthStateWithUsers([user, user2]);
      const action = nukeUsersSuccess();

      const expected = createFakeAuthStateWithUsers([]);
      expect(authReducer(state, action)).toEqual(expected);
    });

    it(`${deleteUserSuccess} => removes the user`, () => {
      const user = createFakeUser({ displayName, localId });
      const user2 = createFakeUser({ displayName: 'pelmeni', localId: 'id2' });
      const state = createFakeAuthStateWithUsers([user, user2]);
      const action = deleteUserSuccess({ localId });

      const expected = createFakeAuthStateWithUsers([user2]);
      expect(authReducer(state, action)).toEqual(expected);
    });

    it(`${updateUserSuccess} => updates the user`, () => {
      const newDisplayName = 'New display name';
      const user = createFakeUser({ displayName, localId });
      const user2 = createFakeUser({ displayName: 'pelmeni', localId: 'id2' });
      const state = createFakeAuthStateWithUsers([user, user2]);
      const action = updateUserSuccess({
        user: createFakeUser({ displayName: newDisplayName, localId }),
      });

      const updatedUser = createFakeUser({
        ...user,
        localId,
        displayName: newDisplayName,
      });

      const expected = createFakeAuthStateWithUsers([updatedUser, user2]);

      expect(authReducer(state, action)).toEqual(expected);
    });

    describe(`${setUserDisabledSuccess}`, () => {
      it(`${setUserDisabledSuccess} => disabled the user`, () => {
        const user = createFakeUser({ displayName, localId });
        const state = createFakeAuthStateWithUsers([user]);
        const action = setUserDisabledSuccess({ localId, disabled: true });

        const result = authReducer(state, action);
        expect(squashOrDefaut(result.users, [])[0].disabled).toEqual(true);
      });

      it(`${setUserDisabledSuccess} => enables the user`, () => {
        const user = createFakeUser({ displayName, localId });
        const state = createFakeAuthStateWithUsers([user]);
        const action = setUserDisabledSuccess({ localId, disabled: false });

        const result = authReducer(state, action);
        expect(squashOrDefaut(result.users, [])[0].disabled).toEqual(false);
      });
    });
  });

  describe('filtering', () => {
    it(`${updateFilter} => sets the filter value`, () => {
      const filter = 'filter value';
      const state = createFakeAuthStateWithUsers([]);
      const action = updateFilter({ filter });

      const result = authReducer(state, action);
      expect(result.filter).toEqual(filter);
    });
  });

  describe('config', () => {
    it(`${setAllowDuplicateEmailsSuccess} => sets the config value`, () => {
      const allowDuplicateEmails = true;
      const state = createFakeState({ allowDuplicateEmails: false });
      const action = setAllowDuplicateEmailsSuccess(allowDuplicateEmails);

      const result = authReducer(state, action);
      expect(result.allowDuplicateEmails).toEqual(allowDuplicateEmails);
    });
  });

  describe('authFetchUsersSuccess', () => {
    it(`${authFetchUsersSuccess} => updates users`, () => {
      const state = createFakeAuthStateWithUsers([]);

      const users: AuthUser[] = [createFakeUser({ localId })];
      const action = authFetchUsersSuccess(users);

      const result = authReducer(state, action);
      expect(result).toEqual(createFakeAuthStateWithUsers(users));
    });
  });

  describe('authFetchUsersError', () => {
    it(`${authFetchUsersError} => sets an error`, () => {
      const state = createFakeAuthStateWithUsers([]);

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
