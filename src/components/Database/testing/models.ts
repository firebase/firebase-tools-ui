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

import firebase from 'firebase';

export function fakeReference({
  key = null as string | null,
  path = '',
  data = null as any,
  parent = null as firebase.database.Reference | null,
  domain = 'http://localhost:9000',
} = {}): firebase.database.Reference {
  return ({
    key,
    path,
    parent,
    child: jest.fn((path: string) => {
      const paths = path.split('/');
      const key = paths[paths.length - 1];
      return fakeReference({ key, path: `${path}/${path}` });
    }),
    update: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    once: jest.fn((event: string) => fakeSnapshot({ key, data })),
    toString: jest.fn(() => `${domain}/${path}`),
    database: {
      app: { options: { databaseURL: 'http://localhost:9000/' } },
    },
  } as unknown) as firebase.database.Reference;
}

export function fakeSnapshot({
  key = null as string | null,
  data = undefined as any,
  ref = {} as firebase.database.Reference,
} = {}): firebase.database.DataSnapshot {
  return ({
    ref,
    key,
    val: () => data,
  } as unknown) as firebase.database.DataSnapshot;
}
