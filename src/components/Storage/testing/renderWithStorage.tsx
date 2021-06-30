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

import { randomId } from '@rmwc/base';
import { act, render, waitFor } from '@testing-library/react';
import { History } from 'history';
import React, { ReactElement } from 'react';
import { useHistory } from 'react-router-dom';

import { UseBucketResult, useBucket } from '../api/useBucket';
import { useStorageFiles, useStorageFilesResult } from '../api/useStorageFiles';
import { FakeStorageWrappers } from './FakeStorageWrappers';
import { mockBuckets } from './mockBuckets';

interface CurrentType {
  storage: useStorageFilesResult;
  history: History;
  bucket: UseBucketResult;
}

export async function renderWithStorage(children: ReactElement) {
  const defaultBucket = randomId('bucket');

  mockBuckets([defaultBucket]);

  const current = {} as CurrentType;

  async function waitForNFiles(n: number) {
    await waitFor(
      () => {
        expect(current.storage.files!.length).toBe(n);
      },
      { timeout: 5000 }
    );
    return true;
  }

  const deleteAllFiles = async () => {
    await waitFor(() => expect(current.storage).toBeDefined());

    await act(async () => {
      await current.storage.deleteAllFiles();
      await waitForNFiles(0);
    });
  };

  const uploadFile = async (name: string, folder?: string) => {
    const filesBeforeUpload = current.storage.files.length;
    const file = new File(['a'.repeat(777)], name);
    await act(async () => {
      await current.storage.uploadFiles([file], folder);
    });

    await waitForNFiles(filesBeforeUpload + 1);
  };

  const Component: React.FC = ({ children }) => {
    current.storage = useStorageFiles();
    current.history = useHistory();
    current.bucket = useBucket();

    return <>{children}</>;
  };

  const fallbackTestId = 'storage-fallback';
  const element = render(
    <FakeStorageWrappers fallbackTestId={fallbackTestId}>
      <Component>{children}</Component>
    </FakeStorageWrappers>
  );

  await waitFor(
    () => {
      expect(element.queryByTestId(fallbackTestId)).toBeNull();
    },
    { timeout: 5000 }
  );

  await deleteAllFiles();

  await waitFor(() => expect(current.storage.files).toBeDefined());

  async function waitForFilesToBeUploaded() {
    return await waitFor(
      () => {
        for (const file of current.storage.files) {
          expect(file.type === 'folder' || file.uploading === undefined).toBe(
            true
          );
        }
      },
      { timeout: 5000 }
    );
  }

  return {
    defaultBucket,
    waitForNFiles,
    uploadFile,
    waitForFilesToBeUploaded,
    ...element,
    current,
  };
}
