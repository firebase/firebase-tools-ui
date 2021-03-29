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

import { useStorage } from 'reactfire';
import useSWR from 'swr';

import { useStorageFiles } from '../../../api/useStorageFiles';
import { StorageFile } from '../../../types';

/**
 * List of allowed mime types for the preview section
 *
 * This list DOES NOT include image/webp as image/webp requires special handling
 * (it's not available in most browsers yet)
 */
const MIME_TYPES_FOR_PREVIEW = [
  'image/bmp',
  'image/gif',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/svg+xml',
];

export function shouldShowPreview(contentType: string): boolean {
  return MIME_TYPES_FOR_PREVIEW.includes(contentType);
}

export const usePreviewUrl = (file: StorageFile) => {
  const storage = useStorage();
  const { getLocation } = useStorageFiles();

  const { data } = useSWR(
    'storage/downloadUrl/' + file.fullPath,
    () => {
      if (!shouldShowPreview(file.contentType)) {
        return Promise.resolve(undefined);
      }
      return storage.refFromURL(getLocation(file.fullPath)).getDownloadURL();
    },
    { suspense: true }
  );
  return data;
};
