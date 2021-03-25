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

import { act, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { FakeStorageWrappers } from '../testing/FakeStorageWrappers';
import { mockBuckets } from '../testing/mockBuckets';
import { useStorageFiles } from './useStorageFiles';

describe('useStorageFiles', () => {
  async function setup() {
    mockBuckets(['bucket']);

    const storage = renderHook(() => useStorageFiles(), {
      wrapper: FakeStorageWrappers,
    });

    await waitFor(() => expect(storage.result.current).toBeDefined());

    await act(async () => {
      await storage.result.current.deleteAllFiles();
    });

    return {
      uploadFile,
      storage,
      waitForNFiles,
      deleteFiles,
    };

    async function waitForNFiles(n: number) {
      await waitFor(() => {
        expect(storage.result.current.files!.length).toBe(n);
      });
      return true;
    }

    async function uploadFile(fileName: string, folderName?: string) {
      const file = new File([''], fileName);

      await act(async () => {
        await storage.result.current.uploadFiles([file], folderName);
      });
    }

    async function deleteFiles(files: string[]) {
      await act(async () => {
        await storage.result.current.deleteFiles(files);
      });
    }
  }

  const fileName = 'lol.txt';
  const folderName = 'folder';

  it('uploads files', async () => {
    const { uploadFile, waitForNFiles, storage } = await setup();
    await uploadFile(fileName);
    await uploadFile('file.txt', folderName);

    await waitForNFiles(2);

    expect(storage.result.current.files[0]).toEqual(
      expect.objectContaining({
        type: 'folder',
        name: folderName,
        fullPath: '/' + folderName,
      })
    );

    expect(storage.result.current.files[1]).toEqual(
      expect.objectContaining({
        type: 'file',
        name: fileName,
        fullPath: fileName,
      })
    );
  });

  it('deletes all files', async () => {
    const { storage, uploadFile, waitForNFiles } = await setup();

    await uploadFile(fileName);
    await uploadFile(fileName, folderName);

    await act(async () => {
      await storage.result.current.deleteAllFiles();
    });

    expect(await waitForNFiles(0)).toBe(true);
  });

  it('deletes specific files', async () => {
    const { uploadFile, storage, waitForNFiles, deleteFiles } = await setup();

    await uploadFile(fileName);
    await uploadFile('keep.me');
    await uploadFile('other.file', folderName);

    await act(async () => {
      await deleteFiles(['/' + folderName, fileName]);
    });

    await waitForNFiles(1);
    expect(storage.result.current.files!.length).toBe(1);
  }, 5000);
});
