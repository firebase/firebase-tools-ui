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

import { all, fork } from 'redux-saga/effects';
import { combineReducers } from 'redux';
import { ConfigState, configReducer, configSaga } from './config';
import { DatabaseState, databaseSaga, databaseReducer } from './database';

export interface AppState {
  config: ConfigState;
  database: DatabaseState;
}

export function* rootSaga() {
  yield all([fork(configSaga), fork(databaseSaga)]);
}

export const rootReducer = combineReducers<AppState>({
  config: configReducer,
  database: databaseReducer,
});
