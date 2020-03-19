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

import { fetchError, fetchRequest, fetchSuccess } from './actions';
import { fetchConfig, fetchConfigApi } from './sagas';
import { Config } from './types';

describe('fetchConfig', () => {
  it('calls config api and dispatches fetchSuccess on success', () => {
    const gen = fetchConfig(fetchRequest());
    expect(gen.next()).toEqual({ done: false, value: call(fetchConfigApi) });

    const config: Config = {
      projectId: 'example',
      database: {
        host: 'localhost',
        port: 8080,
        hostAndPort: 'localhost:8080',
      },
    };
    expect(gen.next(config)).toEqual({
      done: false,
      value: put(fetchSuccess(config)),
    });
    expect(gen.next()).toEqual({ done: true });
  });

  it('calls config api and dispatches fetchError on error', () => {
    const gen = fetchConfig(fetchRequest());
    expect(gen.next()).toEqual({ done: false, value: call(fetchConfigApi) });

    const error = { message: '420 Enhance Your Calm' };
    expect(gen.throw(error)).toEqual({
      done: false,
      value: put(fetchError(error)),
    });
    expect(gen.next()).toEqual({ done: true });
  });
});
