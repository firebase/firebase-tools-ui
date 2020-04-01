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

import { all, call, delay, put, takeLatest } from 'redux-saga/effects';
import { ActionType, getType } from 'typesafe-actions';

import { fetchError, fetchRequest, fetchSuccess, subscribe } from './actions';
import { Config } from './types';

export async function fetchConfigApi(): Promise<Config> {
  const res = await fetch('/api/config');
  if (res.status !== 200) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export function* fetchConfig(_: ActionType<typeof fetchRequest>) {
  try {
    const config: Config = yield call(fetchConfigApi);
    yield put(fetchSuccess(config));
  } catch (e) {
    yield put(fetchError({ message: e.message }));
  }
}

export const POLL_COOLDOWN_MS = 5000;

// TODO: Refactor subscription and polling logic into a common util.
export function* pollConfig() {
  while (true) {
    yield put(fetchRequest());
    yield delay(POLL_COOLDOWN_MS);
  }
}

export function* configSaga() {
  yield all([
    takeLatest(getType(fetchRequest), fetchConfig),
    takeLatest(getType(subscribe), pollConfig),
  ]);
}
