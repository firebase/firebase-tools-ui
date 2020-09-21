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

import { AuthUser } from '../../components/Auth/types';
import {
  addUser,
  clearAllData,
  deleteUser,
  setUserDisabled,
  updateFilter,
  updateUser,
} from './actions';
import { authReducer } from './reducer';

const displayName = 'pirojok';
const localId = '0';

const generateUser = (user: Partial<AuthUser> = {}) => {
  return {
    displayName,
    createdAt: new Date(),
    disabled: false,
    localId,
    ...user,
  };
};

describe('auth reducers', () => {
  describe('user reducers', () => {
    it(`${addUser} => adds a user`, () => {
      const state = { users: [], filter: '' };
      const payload = { displayName };
      const action = addUser({ user: payload });

      const user = generateUser({
        createdAt: expect.any(Date),
        ...payload,
      });

      const expected = { users: [user], filter: '' };
      expect(authReducer(state, action)).toEqual(expected);
    });

    it(`${clearAllData} => clears the data`, () => {
      const user = generateUser({ displayName });
      const user2 = generateUser({ displayName: 'pelmeni' });
      const state = { users: [user, user2], filter: '' };
      const action = clearAllData();

      const expected = { users: [], filter: '' };
      expect(authReducer(state, action)).toEqual(expected);
    });

    it(`${deleteUser} => removes the user`, () => {
      const user = generateUser({ displayName });
      const user2 = generateUser({ displayName: 'pelmeni', localId: 'id2' });
      const state = { users: [user, user2], filter: '' };
      const action = deleteUser({ localId });

      const expected = { users: [user2], filter: '' };
      expect(authReducer(state, action)).toEqual(expected);
    });

    it(`${updateUser} => updates the user`, () => {
      const newDisplayName = 'New display name';
      const user = generateUser({ displayName });
      const user2 = generateUser({ displayName: 'pelmeni', localId: 'id2' });
      const state = { users: [user, user2], filter: '' };
      const action = updateUser({
        user: { displayName: newDisplayName },
        localId,
      });

      const updatedUser = generateUser({
        ...user,
        localId,
        displayName: newDisplayName,
        createdAt: expect.any(Date),
      });

      const expected = { users: [updatedUser, user2], filter: '' };

      expect(authReducer(state, action)).toEqual(expected);
    });

    describe(`${setUserDisabled}`, () => {
      it(`${setUserDisabled} => disabled the user`, () => {
        const user = generateUser({ displayName });
        const state = { users: [user], filter: '' };
        const action = setUserDisabled({ localId, disabled: true });

        const result = authReducer(state, action);
        expect(result.users[0].disabled).toEqual(true);
      });

      it(`${setUserDisabled} => enables the user`, () => {
        const user = generateUser({ displayName });
        const state = { users: [user], filter: '' };
        const action = setUserDisabled({ localId, disabled: false });

        const result = authReducer(state, action);
        expect(result.users[0].disabled).toEqual(false);
      });
    });
  });

  describe('filtering', () => {
    it(`${updateFilter} => sets the filter value`, () => {
      const filter = 'filter value';
      const state = { users: [], filter: '' };
      const action = updateFilter({ filter });

      const result = authReducer(state, action);
      expect(result.filter).toEqual(filter);
    });
  });
});
