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

import { useState } from 'react';

import { StorageFile, StorageItem } from '../../types';

export function useSelectedFile(
  files: StorageItem[]
): [StorageFile | undefined, (file: StorageFile | undefined) => void] {
  const [selectedFile, setSelectedFile] = useState<StorageFile | undefined>(
    undefined
  );

  const result = selectedFile
    ? files.find((file: StorageItem) => file.fullPath === selectedFile.fullPath)
    : undefined;

  return [result as StorageFile, setSelectedFile];
}
