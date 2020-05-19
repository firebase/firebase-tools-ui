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

import { firestore } from 'firebase';

import { initFirestore } from '../../firebase';
import { FirestoreConfig } from '../../store/config';
import { RestApi } from '../common/rest_api';
import { FirestoreApi } from './models';

export default class DatabaseApi extends RestApi implements FirestoreApi {
  private baseUrl: string;
  private baseEmulatorUrl: string;
  private cleanup: () => Promise<void>;
  readonly database: firestore.Firestore;

  constructor(
    public readonly projectId: string,
    public readonly databaseId: string,
    config: FirestoreConfig
  ) {
    super();
    const [database, { cleanup }] = initFirestore(projectId, config);
    this.database = database;
    this.cleanup = cleanup;

    this.baseUrl = `http://${config.hostAndPort}/v1/projects/${projectId}/databases/${databaseId}`;
    this.baseEmulatorUrl = `http://${config.hostAndPort}/emulator/v1/projects/${projectId}/databases/${databaseId}`;
  }

  delete(): Promise<void> {
    return this.cleanup();
  }

  private async getRootCollections(): Promise<firestore.CollectionReference[]> {
    const { json } = await this.jsonRequest(
      `${this.baseUrl}/documents:listCollectionIds`,
      {},
      'POST'
    );
    const collectionIds = json.collectionIds || [];
    return collectionIds.map((id: string) => this.database.collection(id));
  }

  private async getSubCollections(
    docRef: firestore.DocumentReference
  ): Promise<firestore.CollectionReference[]> {
    const encodedPath = docRef.path
      .split('/')
      .map(uri => encodeURIComponent(uri))
      .join('/');
    const { json } = await this.jsonRequest(
      `${this.baseUrl}/documents/${encodedPath}:listCollectionIds`,
      {},
      'POST'
    );
    const collectionIds = json.collectionIds || [];
    return collectionIds.map((id: string) => docRef.collection(id));
  }

  async getCollections(
    docRef?: firestore.DocumentReference
  ): Promise<firestore.CollectionReference[]> {
    return docRef
      ? await this.getSubCollections(docRef)
      : await this.getRootCollections();
  }

  async nukeDocuments() {
    await this.jsonRequest(`${this.baseEmulatorUrl}/documents`, {}, 'DELETE');
    return [];
  }
}
