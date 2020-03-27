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

import { RemoteResult } from '../utils';
import {
  databasesFetchError,
  databasesFetchRequest,
  databasesFetchSuccess,
  databasesSubscribe,
  databasesUnsubscribe,
} from './actions';
import { databaseReducer } from './reducer';
import { DatabaseInfo } from './types';

describe('fetching databases', () => {
  const state = (databases: RemoteResult<DatabaseInfo[]>) => ({
    databases,
    databasesSubscribed: false,
  });

  it(`${databasesFetchRequest} => sets loading to true`, () => {
    expect(
      databaseReducer(state({ loading: false }), databasesFetchRequest())
    ).toEqual(state({ loading: true }));
  });

  it(`${databasesFetchRequest} => preserves existing result`, () => {
    const result = { data: [{ name: 'foo' }] };
    expect(
      databaseReducer(
        state({ loading: false, result }),
        databasesFetchRequest()
      )
    ).toEqual(state({ loading: true, result }));
  });

  it(`${databasesFetchSuccess} => sets databases and unsets loading`, () => {
    const databases: never[] = [];
    expect(
      databaseReducer(
        state({ loading: true }),
        databasesFetchSuccess(databases)
      )
    ).toEqual(state({ loading: false, result: { data: [] } }));
  });

  it(`${databasesFetchSuccess} => sets databases ordered by name`, () => {
    expect(
      databaseReducer(
        state({ loading: true, result: { data: [] } }),
        databasesFetchSuccess([{ name: 'bbb' }, { name: 'aaa' }])
      ).databases.result
    ).toEqual({ data: [{ name: 'aaa' }, { name: 'bbb' }] });
  });

  it(`${databasesFetchError} => sets error and unsets loading`, () => {
    const error = { message: '420 Enhance Your Calm' };
    expect(
      databaseReducer(state({ loading: true }), databasesFetchError(error))
    ).toEqual(state({ loading: false, result: { error } }));
  });
});

describe('subscribing to databases', () => {
  const stateWithSubscribed = (subscribed: boolean) => ({
    databases: { loading: true },
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
