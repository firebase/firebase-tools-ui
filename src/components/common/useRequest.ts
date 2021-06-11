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

import useSwr from 'swr';

interface RequestOptions {
  refreshInterval?: number;
}

export function useFetcher(
  options: RequestInit,
  onSuccess = (r: Response) => r.json()
) {
  return async (url: string) => {
    return await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: 'Bearer owner',
      },
    }).then(onSuccess);
  };
}

export function useRequest<T = unknown>(
  url: string,
  options: RequestInit,
  { refreshInterval = 0 }: RequestOptions
) {
  const fetcher = useFetcher(options);

  return useSwr<T>(url, fetcher, {
    refreshInterval,
    suspense: true,

    // Emulator UI works fully offline. Even if the browser cannot reach LAN or
    // any router, this page and the CONFIG_API will still work if they are on
    // the same physical device (e.g. localhost/127.0.0.1/containers/VMs). See:
    // https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine
    refreshWhenOffline: true,
  });
}
