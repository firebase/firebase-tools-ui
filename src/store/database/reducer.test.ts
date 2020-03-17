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
  databasesFetchError,
  databasesFetchRequest,
  databasesFetchSuccess,
  databasesSubscribe,
  databasesUnsubscribe,
} from './actions';
import { databaseReducer } from './reducer';
import { DatabaseInfoState } from './types';

describe('fetching databases', () => {
  const state = (databases: DatabaseInfoState) => ({
    databases,
    databasesSubscribed: false,
  });

  it(`${databasesFetchRequest} => sets fetching to true`, () => {
    expect(
      databaseReducer(state({ fetching: false }), databasesFetchRequest())
    ).toEqual(state({ fetching: true }));
  });

  it(`${databasesFetchRequest} => preserves existing databases`, () => {
    const databases = [{ name: 'foo' }];
    expect(
      databaseReducer(
        state({ fetching: false, databases }),
        databasesFetchRequest()
      )
    ).toEqual(state({ fetching: true, databases }));
  });

  it(`${databasesFetchSuccess} => sets databases and unsets fetching`, () => {
    const databases: never[] = [];
    expect(
      databaseReducer(
        state({ fetching: true }),
        databasesFetchSuccess(databases)
      )
    ).toEqual(state({ fetching: false, databases }));
  });

  it(`${databasesFetchSuccess} => sets databases ordered by name`, () => {
    expect(
      databaseReducer(
        state({ fetching: true, databases: [] }),
        databasesFetchSuccess([{ name: 'bbb' }, { name: 'aaa' }])
      ).databases.databases
    ).toEqual([{ name: 'aaa' }, { name: 'bbb' }]);
  });

  it(`${databasesFetchError} => sets error and unsets fetching`, () => {
    const error = { message: '420 Enhance Your Calm' };
    expect(
      databaseReducer(state({ fetching: true }), databasesFetchError(error))
    ).toEqual(state({ fetching: false, error }));
  });
});

describe('subscribing to databases', () => {
  const stateWithSubscribed = (subscribed: boolean) => ({
    databases: { fetching: true },
    databasesSubscribed: subscribed,
  });

  it(`${databasesSubscribe} => sets databasesSubscribed to true`, () => {
    expect(
      databaseReducer(stateWithSubscribed(false), databasesSubscribe())
    ).toEqual(stateWithSubscribed(true));
    expect(
      databaseReducer(stateWithSubscribed(true), databasesSubscribe())
    ).toEqual(stateWithSubscribed(true));
  });

  it(`${databasesUnsubscribe} => sets databasesSubscribed to false`, () => {
    expect(
      databaseReducer(stateWithSubscribed(true), databasesUnsubscribe())
    ).toEqual(stateWithSubscribed(false));
    expect(
      databaseReducer(stateWithSubscribed(false), databasesUnsubscribe())
    ).toEqual(stateWithSubscribed(false));
  });
});
