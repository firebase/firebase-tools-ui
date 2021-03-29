/**
 * Copyright 2021 Google LLC
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

import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { AppState } from '../../../store';

export const FakeStorageStoreProvider: React.FC = ({ children }) => {
  const projectId = '';
  const host = 'localhost';
  const port = 9199;
  const hostAndPort = host + ':' + port;

  const store = configureStore<Pick<AppState, 'config'>>()({
    config: {
      loading: false,
      result: {
        data: {
          projectId,
          storage: { hostAndPort, host, port: Number(port) },
        },
      },
    },
  });
  return <Provider store={store}>{children}</Provider>;
};
