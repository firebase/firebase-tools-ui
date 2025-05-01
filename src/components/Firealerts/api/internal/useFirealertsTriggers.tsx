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

import useSWR from 'swr';

import { useEmulatorConfig } from '../../../common/EmulatorConfigProvider';
import { fetchMaybeWithCredentials } from '../../../common/rest_api';
import { FirealertsTrigger } from '../../models';

export function useFirealertsTriggers(): FirealertsTrigger[] {
  const config = useEmulatorConfig('eventarc');
  const FIREALERTS_EVENT_TYPE =
    'google.firebase.firebasealerts.alerts.v1.published-google';
  const fetcher = async (url: URL) => {
    const response = await fetchMaybeWithCredentials(url.toString());
    const json = await response.json();
    return json;
  };

  const { data } = useSWR(
    `//${config.hostAndPort}/google/getTriggers`,
    fetcher,
    { suspense: true }
  );
  return data[FIREALERTS_EVENT_TYPE];
}
