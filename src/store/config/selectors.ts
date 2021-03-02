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

import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { Result, hasError, map } from '../utils';
import { FirestoreConfig } from './types';
import { AppState } from '..';

// Get the RemoteResult wrapper for config. If you only care about result,
// use getConfigResult instead for better caching.
export const getConfig = (state: AppState) => state.config;

export const getConfigResult = (state: AppState) => state.config.result;

// Get whether config is being loaded / refreshed. Note: To check whether config
// is present, use getConfigResult. This only tells whether we're fetching.
export const getConfigLoading = (state: AppState) => state.config.loading;

export const getProjectIdResult = createSelector(getConfigResult, (result) =>
  map(result, (config) => config.projectId)
);

export const getDatabaseConfigResult = createSelector(
  getConfigResult,
  (result) => map(result, (config) => config.database)
);

export const getFirestoreConfigResult = createSelector(
  getConfigResult,
  (result) => map(result, (config) => config.firestore)
);

function useRemoteResultData<T = {}>(result: Result<T> | undefined) {
  if (!result) {
    throw new Error('Result data requested that is not yet populated');
  }
  if (hasError(result)) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export function useProjectId() {
  const projectId = useSelector(getProjectIdResult);
  return useRemoteResultData(projectId);
}

export function useFirestoreConfig() {
  const config = useSelector(getFirestoreConfigResult);
  return useRemoteResultData<FirestoreConfig | undefined>(config);
}
