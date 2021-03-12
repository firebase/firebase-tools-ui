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
