/**
 * Copyright 2022 Google LLC
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
import useSwr from 'swr';

import { useEmulatorConfig } from '../../../common/EmulatorConfigProvider';
import { ScheduledFunction } from '../../models';

export function useScheduledFunctions(): ScheduledFunction[] {
  const config = useEmulatorConfig('functions');

  const fetcher = async () => {
    const url = `//${config.hostAndPort}/scheduled`;
    console.log(`Fetching scheduled from ${url}`);
    const response = await fetch(url);
    const json = await response.json();
    return json.scheduled;
  };

  const functions = useSwr(`list_scheduled`, fetcher, { suspense: true }).data;

  return functions;
}

export function forceRunScheduledFunction(
  triggerId: string,
  hostAndPort: string,
  setShowForceRunNotification: (show: boolean) => void
) {
  const url = `//${hostAndPort}/force_run/${triggerId}`;

  fetch(url, { method: 'POST' })
    .then((response) => response.json())
    .then((data) => {
      setShowForceRunNotification(true);
      console.log(data);
    })
    .catch((error) => {
      console.error(error);
    });
}
