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
