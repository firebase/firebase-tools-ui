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
} from './actions';
import { databaseReducer } from './reducer';

it(`${databasesFetchRequest} => sets fetching to true`, () => {
  expect(
    databaseReducer({ databases: { fetching: false } }, databasesFetchRequest())
  ).toEqual({ databases: { fetching: true } });
});

it(`${databasesFetchSuccess} => sets config and unsets fetching`, () => {
  const databases: never[] = [];
  expect(
    databaseReducer(
      { databases: { fetching: true } },
      databasesFetchSuccess(databases)
    )
  ).toEqual({ databases: { fetching: false, databases } });
});

it(`${databasesFetchError} => sets error and unsets fetching`, () => {
  const error = { message: '420 Enhance Your Calm' };
  expect(
    databaseReducer(
      { databases: { fetching: true } },
      databasesFetchError(error)
    )
  ).toEqual({ databases: { fetching: false, error } });
});
