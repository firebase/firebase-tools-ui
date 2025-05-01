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

import { DatabaseReference } from 'firebase/database';

import { useEmulatorConfig } from '../common/EmulatorConfigProvider';
import { fetchMaybeWithCredentials } from '../common/rest_api';
import { useNamespace } from './useNamespace';

/** Get absolute path for file upload (the path with `.upload` appended) */
function useUploadPath(ref: DatabaseReference) {
  const absolutePath = new URL(ref.toString()).pathname;
  // trim leading and trailing slashes
  let path = absolutePath.replace(/^\//, '').replace(/\/$/, '');
  if (path !== '') {
    path = path + '/';
  }
  path += '.upload';
  return path;
}

/**
 * Import a file at a specific path within the current database.
 */
export function useImport(
  ref: DatabaseReference,
  file: File | undefined,
  options: { disableTriggers?: boolean } = {}
) {
  const namespace = useNamespace();
  const config = useEmulatorConfig('database');
  const uploadPath = useUploadPath(ref);
  const params = new URLSearchParams({
    ns: namespace,
    // Pass token in query since headers triggers CORS.
    access_token: 'owner',
    writeSizeLimit: 'unlimited',
  });

  if (options.disableTriggers) {
    params.set('disableTriggers', 'true');
  }

  const path = `${uploadPath}?${params.toString()}`;
  const formData = new FormData();
  if (file) {
    formData.append('myFile', file);
  }

  return () =>
    fetchMaybeWithCredentials(`//${config.hostAndPort}/${path}`, {
      method: 'POST',
      body: formData,
    });
}
