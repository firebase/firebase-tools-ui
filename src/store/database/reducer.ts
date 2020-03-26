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

import { Action, createReducer } from 'typesafe-actions';

import {
  databasesFetchError,
  databasesFetchRequest,
  databasesFetchSuccess,
  databasesSubscribe,
  databasesUnsubscribe,
} from './actions';
import { DatabaseState } from './types';

export const databaseReducer = createReducer<DatabaseState, Action>({
  databases: { loading: false },
  databasesSubscribed: false,
})
  .handleAction(databasesFetchRequest, (props, _) => ({
    ...props,
    databases: { loading: true, result: props.databases.result },
  }))
  .handleAction(databasesFetchSuccess, (props, { payload }) => {
    const databases = [...payload];
    databases.sort((db1, db2) => db1.name.localeCompare(db2.name));
    return {
      ...props,
      databases: { loading: false, result: { data: databases } },
    };
  })
  .handleAction(databasesFetchError, (props, { payload }) => {
    return {
      ...props,
      databases: { loading: false, result: { error: payload } },
    };
  })
  .handleAction(databasesSubscribe, (props, _) => {
    return { ...props, databasesSubscribed: true };
  })
  .handleAction(databasesUnsubscribe, (props, _) => {
    return { ...props, databasesSubscribed: false };
  });
