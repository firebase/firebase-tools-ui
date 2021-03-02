/**
 * Copyright 2021 Google LLC
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
  createFakeUser,
} from '../../components/Auth/test_utils';
import { AuthUser } from '../../components/Auth/types';
import { AppState } from '../index';
import { getFilteredUsers } from './selectors';

describe('Auth selectors', () => {
  function createState(users: AuthUser[], filter: string) {
    const authState = { ...createFakeAuthStateWithUsers(users), filter };
    return { auth: authState } as AppState;
  }

  describe('getFilteredUsers', () => {
    function createUsers() {
      return [
        createFakeUser({
          displayName: 'pirojok',
          localId: 'oTODG2PkpGR8rljFEqTTIjgdLklN123',
        }),
        createFakeUser({
          displayName: 'pelmeni',
          localId: 'NlkLdgjITTqEFjlr8RGpkP2GDOToNlkLdgjITTqEFjlr8RGpkP2GDOTo',
        }),
      ];
    }

    it('returns all users for empty filter', () => {
      expect(getFilteredUsers(createState(createUsers(), ''))).toEqual(
        createUsers()
      );
    });

    it('is case insensitive', () => {
      expect(getFilteredUsers(createState(createUsers(), 'PIROJOK'))).toEqual([
        createUsers()[0],
      ]);
    });
  });
});
