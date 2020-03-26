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
import { createSelector } from 'reselect';
import { ActionType, getType } from 'typesafe-actions';

import { DatabaseConfig } from '../config';
import { getDatabaseConfig, getProjectId } from '../config/selectors';
import { combineData, hasError } from '../utils';
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

const getProjectIdAndDbConfig = createSelector(
  getProjectId,
  getDatabaseConfig,
  (projectIdRemote, configRemote) =>
    combineData([projectIdRemote, configRemote])
);

type ProjectIdAndDbConfigRemote = ReturnType<typeof getProjectIdAndDbConfig>;

export function* getDbConfig(): Generator<unknown, GetDbConfigReturn> {
  const remote = (yield select(
    getProjectIdAndDbConfig
  )) as ProjectIdAndDbConfigRemote;
  if (!remote.result) {
    throw new Error('Database emulator config is not ready yet.');
  }
  if (hasError(remote.result)) {
    throw new Error(
      'Error fetching Database emulator config: ' + remote.result.error.message
    );
  }
  const [projectId, config] = remote.result.data;
  if (!config) {
    throw new Error('Database emulator is not started!');
  }
  return { projectId, config };
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

export const POLL_DATABASE_COOLDOWN_MS = 5000;
export const getDatabasesSubscribed = (state: AppState) =>
  state.database.databasesSubscribed;

export function* pollDatabases(): Generator<any> {
  while (true) {
    yield take(getType(databasesSubscribe));
    while (yield select(getDatabasesSubscribed)) {
      yield put(databasesFetchRequest());
      yield delay(POLL_DATABASE_COOLDOWN_MS);
    }
  }
}

export function* databaseSaga() {
  yield all([
    takeLatest(getType(databasesFetchRequest), fetchDatabases),
    pollDatabases(),
  ]);
}
