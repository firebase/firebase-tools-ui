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
  all,
  call,
  delay,
  put,
  select,
  take,
  takeLatest,
} from 'redux-saga/effects';
import { ActionType, getType } from 'typesafe-actions';

import {
  Config,
  DatabaseConfig,
  fetchSuccess as configFetchSuccess,
} from '../config';
import {
  databasesFetchError,
  databasesFetchRequest,
  databasesFetchSuccess,
  databasesSubscribe,
} from './actions';
import { DatabaseInfo } from './types';
import { AppState } from '..';

export async function fetchDatabasesApi(
  config: DatabaseConfig,
  projectId: string
): Promise<DatabaseInfo[]> {
  const res = await fetch(
    `http://${config.hostAndPort}/.inspect/databases.json?ns=${projectId}`
  );
  return res.json();
}

export interface GetDbConfigReturn {
  config: DatabaseConfig;
  projectId: string;
}

export function* getDbConfig(): Generator<unknown, GetDbConfigReturn> {
  const selectEffect = select((state: AppState) => state.config.config);
  let config = (yield selectEffect) as Config | undefined;
  if (!config) {
    yield take(getType(configFetchSuccess)); // Wait for config to load.
    config = (yield selectEffect) as Config;
  }

  if (!config.database) {
    throw new Error('Database emulator is not started!');
  }
  return { projectId: config.projectId, config: config.database };
}

export function* fetchDatabases(
  _: ActionType<typeof databasesFetchRequest>
): Generator<any> {
  try {
    const { projectId, config } = (yield call(
      getDbConfig
    )) as GetDbConfigReturn;
    const databases = (yield call(
      fetchDatabasesApi,
      config,
      projectId
    )) as DatabaseInfo[];
    yield put(databasesFetchSuccess(databases));
  } catch (e) {
    yield put(databasesFetchError({ message: e.message }));
  }
}

const POLL_DATABASE_COOLDOWN_MS = 5000;

export function* pollDatabases(): Generator<any> {
  while (true) {
    yield take(getType(databasesSubscribe));
    while (
      yield select((state: AppState) => state.database.databasesSubscribed)
    ) {
      yield put(databasesFetchRequest());
      yield delay(POLL_DATABASE_COOLDOWN_MS);
    }
  }
}

export function* databaseSaga() {
  // TODO: Consider fetching automatically every 5 seconds.
  yield all([
    takeLatest(getType(databasesFetchRequest), fetchDatabases),
    pollDatabases(),
  ]);
}
