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

import { useEmulatorConfig } from '../../common/EmulatorConfigProvider';
import { fetchMaybeWithCredentials } from '../../common/rest_api';
import { useBucket } from './useBucket';

const EMPTY_FOLDER_DATA = `--boundary\r
Content-Type: application/json\r
\r
{"contentType":"text/plain"}\r
--boundary\r
Content-Type: text/plain\r
\r
--boundary--\r
`;

export function useCreateFolder() {
  const config = useEmulatorConfig('storage');
  const [bucket] = useBucket();

  async function createFolder(fullPath: string) {
    const normalizedPath = fullPath.replace(/\/+/g, '/').replace(/^\//, '');
    const encodedPath = encodeURIComponent(normalizedPath);

    await fetchMaybeWithCredentials(
      `http://${
        config!.hostAndPort
      }/upload/storage/v1/b/${bucket}/o?name=${encodedPath}/`,
      {
        headers: {
          'Content-Type': 'multipart/related; boundary=boundary',
        },
        method: 'POST',
        body: new Blob([EMPTY_FOLDER_DATA]),
      }
    );
  }

  return {
    createFolder,
  };
}
