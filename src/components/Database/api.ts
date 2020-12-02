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
import firebase from 'firebase';

import { initDatabase } from '../../firebase';
import { DatabaseConfig } from '../../store/config';
import { RestApi } from '../common/rest_api';

export class DatabaseApi extends RestApi {
  private readonly baseUrl: string;
  private cleanup: () => Promise<void>;
  readonly database: firebase.database.Database;

  constructor(config: DatabaseConfig, private readonly namespace: string) {
    super();
    const [database, { cleanup }] = initDatabase(config, this.namespace);
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
  async importFile(ref: firebase.database.Reference, file: File) {
    const params = new URLSearchParams({
      ns: this.namespace,
      // Pass token in query since headers triggers CORS.
      access_token: 'owner',
    });
    const path = getUploadPath(ref) + `?${params.toString()}`;
    return await this.postFile(`${this.baseUrl}/${path}`, file);
  }
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
