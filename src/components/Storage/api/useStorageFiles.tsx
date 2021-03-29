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

import firebase from 'firebase';
import { useStorage } from 'reactfire';
import useSwr from 'swr';

import { assert } from '../../common/asserts';
import { fileToStorageFile } from '../common/fileToStorageFile';
import { StorageFile, StorageFolder, StorageItem } from '../types';
import { useBucket } from './useBucket';
import { useCreateFolder } from './useCreateFolder';
import { usePath } from './usePath';

async function importFile(
  fileRef: firebase.storage.Reference
): Promise<StorageFile> {
  const metadata = await fileRef.getMetadata();
  return { type: 'file', ...metadata };
}

function importFolder(folder: firebase.storage.Reference): StorageFolder {
  return {
    type: 'folder',
    name: folder.name,
    fullPath: folder.fullPath,
  };
}

export function useStorageFiles() {
  const storage = useStorage();
  const [bucket, setBucket] = useBucket();
  const [path, setPath] = usePath();
  const { createFolder } = useCreateFolder();

  function getLocation(path = '') {
    return `gs://${bucket}/${path}`;
  }

  function getCurrentRef(folder = path) {
    return storage.refFromURL(getLocation(folder));
  }

  const bucketHasAnyFiles = useSwr(
    `storage/hasFiles/${bucket}/`,
    async (): Promise<boolean> => {
      const { items, prefixes } = await getCurrentRef('').listAll();
      return !!items.length || !!prefixes.length;
    },
    { suspense: true }
  );

  const result = useSwr(
    `storage/${bucket}/${path}`,
    async (): Promise<StorageItem[]> => {
      const { items, prefixes } = await getCurrentRef().listAll();

      return [
        ...prefixes.map(importFolder),
        ...(await Promise.all(items.map(importFile))),
      ];
    },
    { suspense: true }
  );

  const files = result.data || [];

  async function deleteFile(path: string): Promise<void> {
    return await getCurrentRef('').child(path).delete();
  }

  async function deleteFolder(path: string): Promise<void> {
    const { items, prefixes } = await getCurrentRef(path).listAll();

    try {
      /**
       * We don't know if physical folder exists, or it is inferred from
       * nested file path.
       *
       * So here we attempt to delete physical representation, but if it does
       * not exist, we just swallow the error.
       */
      await deleteFile(path + '%2f');
    } catch {
      // quietly swallow any errors.
    }

    const prefixesPromise: Promise<void>[] = prefixes.map(async (prefix) => {
      return await deleteFolder(prefix.fullPath);
    });

    const filesPromise: Promise<void>[] = items.map(async (file) => {
      return await file.delete();
    });

    await Promise.all([...filesPromise, ...prefixesPromise]);
  }

  async function deleteAllFiles() {
    return await deleteFolder('');
  }

  function uploadFiles(files: File[], folder?: string) {
    return Promise.all(
      files.map((file) => {
        const path = folder ? `${folder}/${file.name}` : file.name;
        return getCurrentRef().child(path).put(file);
      })
    );
  }

  async function deleteFiles(paths: string[]) {
    return await Promise.all(
      paths.map(async (path: string) => {
        const file = files.find((file) => file.fullPath === path);
        assert(file);

        if (file.type === 'folder') {
          return await deleteFolder(file.fullPath);
        } else {
          return await deleteFile(file.fullPath);
        }
      })
    );
  }

  async function openAllFiles(paths: string[]) {
    const links = await Promise.all(
      paths
        .map((path) => storage.refFromURL(getLocation() + '/' + path))
        .map((d) => d.getDownloadURL())
    );

    links.forEach((url) => {
      const a: HTMLAnchorElement = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.click();
    });
  }

  return {
    files,
    setBucket,
    bucket,
    path,
    setPath,
    bucketHasAnyFiles: bucketHasAnyFiles.data,
    getLocation,
    async uploadFiles(uploadedFiles: File[], folderName?: string) {
      // Optimistically display new file on top with the loading state.
      const names = new Set(uploadedFiles.map(({ name }) => name));
      const oldFiles = files.filter((file) => !names.has(file.name));

      const newFiles = uploadedFiles.map((file) =>
        fileToStorageFile(file, bucket, path)
      );
      result.mutate([...newFiles, ...oldFiles], false);

      await uploadFiles(uploadedFiles, folderName);

      await result.mutate();
      await bucketHasAnyFiles.mutate();
    },
    async deleteAllFiles() {
      await result.mutate([], false);
      setPath('');
      await deleteAllFiles();
      await result.mutate();
      await bucketHasAnyFiles.mutate();
    },
    openAllFiles,
    async createFolder(name: string) {
      createFolder(path + '/' + name);
      await result.mutate();
      await bucketHasAnyFiles.mutate();
    },
    async deleteFiles(paths: string[]) {
      // Optimistically hide file
      const pathsSet = new Set(paths);
      const remainingFiles = files.filter(
        (file) => !pathsSet.has(file.fullPath)
      );
      result.mutate(remainingFiles, false);

      await deleteFiles(paths);
      await result.mutate();
      await bucketHasAnyFiles.mutate();
    },
  };
}

export type useStorageFilesResult = ReturnType<typeof useStorageFiles>;
