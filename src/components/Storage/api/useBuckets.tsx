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

import { useEmulatorConfig } from '../../common/EmulatorConfigProvider';
import { useBucket } from './useBucket';

export interface Bucket {
  name: string;
}

export function useBuckets() {
  const config = useEmulatorConfig('storage');
  const [bucket] = useBucket();

  const fetcher = async () => {
    const response = await fetch('http://' + config.hostAndPort + '/b');
    const json = await response.json();
    return json.items.map((b: Bucket) => b.name);
  };

  const result = useSWR('storage/buckets/' + bucket, fetcher, {
    suspense: true,
  }).data;

  if (!result.includes(bucket)) {
    return [...result, bucket];
  }

  return result;
}
