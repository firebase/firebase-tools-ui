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

import { call, delay, put, select, take } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import {
  databasesFetchError,
  databasesFetchRequest,
  databasesFetchSuccess,
  databasesSubscribe,
} from './actions';
import {
  GetDbConfigReturn,
  POLL_DATABASE_COOLDOWN_MS,
  fetchDatabases,
  fetchDatabasesApi,
  getDatabasesSubscribed,
  getDbConfig,
  pollDatabases,
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

describe('pollDatabases', () => {
  it('poll dbs every 5 second when subscribed', () => {
    const gen = pollDatabases();
    expect(gen.next()).toEqual({
      done: false,
      value: take(getType(databasesSubscribe)),
    });

    expect(gen.next(databasesSubscribe())).toEqual({
      done: false,
      value: select(getDatabasesSubscribed),
    });

    expect(gen.next(true)).toEqual({
      done: false,
      value: put(databasesFetchRequest()),
    });

    expect(gen.next()).toEqual({
      done: false,
      value: delay(POLL_DATABASE_COOLDOWN_MS),
    });

    // Check whether we're subscribed again after waiting.
    expect(gen.next()).toEqual({
      done: false,
      value: select(getDatabasesSubscribed),
    });

    // If not subscribed, block until next databasesSubscribe action.
    expect(gen.next(false)).toEqual({
      done: false,
      value: take(getType(databasesSubscribe)),
    });
  });
});
