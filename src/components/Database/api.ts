/**
 * Copyright 2019 Google LLC
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

import { initDatabase } from '../../firebase';
import { DatabaseConfig } from '../../store/config';
import { RestApi } from '../common/rest_api';

export class DatabaseApi extends RestApi {
  private readonly baseUrl: string;
  private cleanup: () => Promise<void>;
  readonly database: firebase.database.Database;

  constructor(config: DatabaseConfig, namespace: string) {
    super();
    const [database, { cleanup }] = initDatabase(config, namespace);
    this.database = database;
    this.cleanup = cleanup;
    this.baseUrl = `http://${config.hostAndPort}`;
  }

  delete(): Promise<void> {
    return this.cleanup();
  }

  /**
   * Import a file at a specific path within the current database.
   */
  async importFile(
    ref: firebase.database.Reference,
    namespace: string,
    file: File
  ) {
    const params = new URLSearchParams({ ns: namespace });
    const path = getUploadPath(ref) + `?${params.toString()}`;
    return await this.restRequest(
      `${this.baseUrl}/${path}`,
      toFormData(file),
      // { a: 'b' },
      'POST',
      'multipart/form-data'
    );
  }
}

/** build `multipart/form-data` payload */
function toFormData(file: File) {
  const formData = new FormData();
  formData.append('upload', file);
  return formData;
}

/** Get absolute path for file upload (the path with `.upload` appended) */
function getUploadPath(ref: firebase.database.Reference) {
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
 * Convert the FileReader.readAsText to a promise interface.
 */
function readFile(file: File): Promise<string | undefined | null> {
  return new Promise((resolve, reject) => {
    if (window.FileReader) {
      reject(new Error('HTML5 File API not supported'));
    }
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result;
      resolve(result && result.toString());
    };
    reader.onerror = e => {
      reject(e);
    };
    reader.readAsText(file);
  });
}

/**
 * Reads the file and validates the JSON content.
 */
async function validateJSON(file: File) {
  const json = await readFile(file);
  JSON.parse(json || 'null');
  return file;
}
