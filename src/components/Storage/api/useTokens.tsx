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

export function useTokens(fullPath: string) {
  const config = useEmulatorConfig('storage');
  const [bucket] = useBucket();
  const key = `storage/tokens/${bucket}/${fullPath}`;

  const fetcher = async () => {
    const url = `http://${
      config.hostAndPort
    }/v0/b/${bucket}/o/${encodeURIComponent(fullPath)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: 'Bearer owner' },
    });

    const result = await response.json();

    return (result.downloadTokens || '').split(',').filter((t: string) => !!t);
  };

  const { data, mutate } = useSWR<string[]>(key, fetcher, {
    suspense: true,
  });

  async function createToken() {
    await fetch(
      `http://${config!.hostAndPort}/v0/b/${bucket}/o/${encodeURIComponent(
        fullPath
      )}?create_token=true`,

      {
        headers: { Authorization: 'Bearer owner' },
        method: 'POST',
      }
    );

    mutate();
  }

  async function deleteToken(token: string) {
    await fetch(
      `http://${config!.hostAndPort}/v0/b/${bucket}/o/${encodeURIComponent(
        fullPath
      )}?delete_token=${token}`,
      {
        headers: { Authorization: 'Bearer owner' },
        method: 'POST',
      }
    );

    mutate();
  }

  return {
    tokens: data || [],
    createToken,
    deleteToken,
  };
}
