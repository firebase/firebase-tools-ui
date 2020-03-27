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

import { fetchError, fetchRequest, fetchSuccess } from './actions';
import { configReducer } from './reducer';

it(`${fetchRequest} => sets loading to true`, () => {
  expect(configReducer({ loading: false }, fetchRequest())).toEqual({
    loading: true,
  });
});

it(`${fetchSuccess} => sets config and unsets loading`, () => {
  const config = {
    projectId: 'example',
    database: { hostAndPort: 'localhost:8080', host: 'localhost', port: 8080 },
  };
  expect(configReducer({ loading: true }, fetchSuccess(config))).toEqual({
    loading: false,
    result: { data: config },
  });
});

it(`${fetchError} => sets error and unsets loading`, () => {
  const error = { message: '420 Enhance Your Calm' };
  expect(configReducer({ loading: true }, fetchError(error))).toEqual({
    loading: false,
    result: { error },
  });
});
