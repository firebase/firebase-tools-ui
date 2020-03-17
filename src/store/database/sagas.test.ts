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

import { call, put } from 'redux-saga/effects';

import {
  databasesFetchError,
  databasesFetchRequest,
  databasesFetchSuccess,
} from './actions';
import {
  GetDbConfigReturn,
  fetchDatabases,
  fetchDatabasesApi,
  getDbConfig,
} from './sagas';
import { DatabaseInfo } from './types';

describe('fetchDatabases', () => {
  it('calls RTDB api and dispatches databasesFetchSuccess on success', () => {
    const gen = fetchDatabases(databasesFetchRequest());
    expect(gen.next()).toEqual({ done: false, value: call(getDbConfig) });

    const config: GetDbConfigReturn = {
      config: { hostAndPort: 'localhost:9000', host: 'localhost', port: 9000 },
      projectId: 'foo',
    };
    expect(gen.next(config)).toEqual({
      done: false,
      value: call(fetchDatabasesApi, config.config, config.projectId),
    });

    const databases: DatabaseInfo[] = [];
    expect(gen.next(databases)).toEqual({
      done: false,
      value: put(databasesFetchSuccess(databases)),
    });
    expect(gen.next()).toEqual({ done: true });
  });

  it('calls RTDB api and dispatches databasesFetchError on error', () => {
    const gen = fetchDatabases(databasesFetchRequest());
    expect(gen.next()).toEqual({ done: false, value: call(getDbConfig) });

    const config: GetDbConfigReturn = {
      config: { hostAndPort: 'localhost:9000', host: 'localhost', port: 9000 },
      projectId: 'foo',
    };
    expect(gen.next(config)).toEqual({
      done: false,
      value: call(fetchDatabasesApi, config.config, config.projectId),
    });

    const error = { message: '420 Enhance Your Calm' };
    expect(gen.throw(error)).toEqual({
      done: false,
      value: put(databasesFetchError(error)),
    });
    expect(gen.next()).toEqual({ done: true });
  });
});
