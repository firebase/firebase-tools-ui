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

import { EmulatorConfig } from '../../../store/config';
import { getStorageConfigResult } from '../../../store/config/selectors';
import { hasError } from '../../../store/utils';

// Suspense aware wrapper.
export function useStorageConfig(): EmulatorConfig {
  const config = useSelector(getStorageConfigResult);

  if (!config) {
    throw Promise.resolve();
  }

  if (hasError(config)) {
    throw config.error;
  }

  return config.data!;
}
