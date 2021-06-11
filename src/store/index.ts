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

import { combineReducers } from 'redux';
import { all, fork } from 'redux-saga/effects';
import * as reselect from 'reselect';

import { AuthState } from '../components/Auth/types';
import { authReducer } from './auth/reducer';
import { authSaga } from './auth/sagas';

// DEPRECATED, do not add more Redux states / reducers. Instead, use `swr` for
// simple fetches and polling, and consider keeping state locally using hooks.
export interface AppState {
  auth: AuthState; // still kept in Redux for historical reasons.
}

export function* rootSaga() {
  yield all([fork(authSaga)]);
}

export const rootReducer = combineReducers<AppState>({
  auth: authReducer,
});

export function createStructuredSelector<T>(
  selectors: { [K in keyof T]: reselect.Selector<AppState, T[K]> }
) {
  return reselect.createStructuredSelector<AppState, T>(selectors);
}
