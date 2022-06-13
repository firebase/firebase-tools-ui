import { DatabaseReference } from 'firebase/database';

import { useEmulatorConfig } from '../common/EmulatorConfigProvider';
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
    fetch(`http://${config.hostAndPort}/${path}`, {
      method: 'POST',
      body: formData,
    });
}
