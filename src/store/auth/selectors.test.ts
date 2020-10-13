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
