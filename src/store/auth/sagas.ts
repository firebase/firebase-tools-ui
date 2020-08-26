import { all, put } from 'redux-saga/effects';

import { addUser } from './actions';

export function* authSaga() {
  yield all([
    put(
      addUser({
        user: {
          displayName: 'pirojok',
          customAttributes: [
            { role: 'lol', value: 'pickah' },
            { role: 'lol2', value: 'pickah2' },
            { role: 'lol3', value: 'pickah3' },
          ],
          email: 'a@b.lol',
          password: 'lol',
          phone: 'lol',
          photoUrl:
            'https://pbs.twimg.com/profile_images/857777762219814912/5vBuo9nc_400x400.jpg',
        },
      })
    ),
    put(addUser({ user: { displayName: 'banan' } })),
    put(addUser({ user: { displayName: 'pikachu' } })),
  ]);
}
