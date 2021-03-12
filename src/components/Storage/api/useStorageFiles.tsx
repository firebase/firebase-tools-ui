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
import useSwr from 'swr';

import { fileToStorageFile } from '../common/fileToStorageFile';
import { StorageFile, StorageFolder, StorageItem } from '../types';
import { useBucket } from './useBucket';
import { usePath } from './usePath';

async function importFile(file: any): Promise<StorageFile> {
  const metadata = await file.getMetadata();
  return { type: 'file', ...metadata };
}

function importFolder(folder: any): StorageFolder {
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

  function getLocation(path = '') {
    return `gs://${bucket}/${path}`;
  }

  function getCurrentRef(folder = path) {
    return storage.refFromURL(getLocation(folder));
  }

  const files = useSwr(
    `storage/${bucket}/${path}`,
    async (): Promise<StorageItem[]> => {
      const { items, prefixes } = await getCurrentRef().listAll();
      // await new Promise(resolve => window.setTimeout(resolve, 2000));
      return [
        ...prefixes.map(importFolder),
        ...(await Promise.all(items.map(importFile))),
      ];
    },
    { suspense: true }
  );

  async function deleteFile(path: string): Promise<any> {
    return await getCurrentRef('').child(path).delete();
  }

  async function deleteFolder(path: string): Promise<any> {
    const { items, prefixes } = await getCurrentRef(path).listAll();

    const prefixesPromise = prefixes.map((prefix) =>
      deleteFolder(prefix.fullPath)
    );

    const filesPromise = items.map(async (file) => {
      return await file.delete();
    });

    return await Promise.all([...filesPromise, ...prefixesPromise]);
  }

  async function deleteAllFiles() {
    return await deleteFolder('');
  }

  function uploadFiles(files: File[], folder?: string) {
    return Promise.all(
      files.map((file) => {
        const path = folder ? `${folder}/${file.name}` : file.name;
        console.log({ path });
        console.log({ file }, file.name);
        console.log(bucket);
        debugger;
        return getCurrentRef().child(path).put(file);
      })
    );
  }

  async function deleteFiles(paths: string[]) {
    return await Promise.all(
      paths
        .map(
          (path) => (files.data || []).find((file) => file.fullPath === path)!
        )
        .map(async (file: StorageItem) => {
          if (file.type === 'folder') {
            return await deleteFolder(file.fullPath);
          } else {
            try {
              return await deleteFile(file.fullPath);
            } catch (e) {
              debugger;
            }
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
    files: files.data || [],
    setBucket,
    bucket,
    path,
    setPath,
    getLocation,
    async uploadFiles(uploadedFiles: File[], folderName?: string) {
      // Optimistically display new files on top with the loading state.
      const names = new Set(uploadedFiles.map(({ name }) => name));
      const oldFiles = (files.data || []).filter(
        (file) => !names.has(file.name)
      );
      console.log('uploading 0 ...');
      const newFiles = uploadedFiles.map((file) =>
        fileToStorageFile(file, bucket, path)
      );
      files.mutate([...newFiles, ...oldFiles], false);
      console.log('uploading 1...');
      await uploadFiles(uploadedFiles, folderName);

      console.log('then');
      await files.mutate();
    },
    async deleteAllFiles() {
      await files.mutate([], false);
      await deleteAllFiles();
      await files.mutate();
    },
    openAllFiles,
    async deleteFiles(paths: string[]) {
      // Optimistically hide files
      const pathsSet = new Set(paths);
      const remainingFiles = (files.data || []).filter(
        (file) => !pathsSet.has(file.fullPath)
      );
      files.mutate(remainingFiles, false);

      await deleteFiles(paths);
      await files.mutate();
    },
  };
}

export type useStorageFilesResult = ReturnType<typeof useStorageFiles>;
