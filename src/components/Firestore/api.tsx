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
import { FirestoreApi } from './models';

type RequestMethod = 'GET' | 'POST' | 'DELETE';

export default class DatabaseApi implements FirestoreApi {
  private baseUrl: string;
  private baseEmulatorUrl: string;
  private getToken: () => Promise<{ accessToken: string }>;
  private cleanup: () => Promise<void>;
  readonly database: firestore.Firestore;

  constructor(
    public readonly projectId: string,
    public readonly databaseId: string,
    private config: FirestoreConfig
  ) {
    const [database, { cleanup }] = initFirestore(projectId, config);
    this.getToken = async () => ({ accessToken: 'owner' });
    this.database = database;
    this.cleanup = cleanup;

    this.baseUrl = `http://${config.hostAndPort}/v1/projects/${projectId}/databases/${databaseId}/`;
    this.baseEmulatorUrl = `http://${config.hostAndPort}/emulator/v1/projects/${projectId}/databases/${databaseId}/`;
  }

  delete(): Promise<void> {
    return this.cleanup();
  }

  private async restRequest<RES = any, REQ = {}>(
    path: string,
    params: REQ,
    baseUrl: string,
    method: RequestMethod
  ): Promise<{ res: Response; json: RES }> {
    const { accessToken } = await this.getToken();

    const url = new URL(baseUrl + path);

    if (method === 'GET' && params) {
      Object.entries(params).forEach(([k, v]) => {
        url.searchParams.set(k, v);
      });
    }

    const res = await fetch(url.toString(), {
      method,
      body: method !== 'GET' ? JSON.stringify(params) : undefined,
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
    });
    const json = await res.json();
    return { res, json };
  }

  private async getRootCollections(): Promise<firestore.CollectionReference[]> {
    const { json } = await this.restRequest(
      'documents:listCollectionIds',
      {},
      this.baseUrl,
      'POST'
    );
    const collectionIds = json.collectionIds || [];
    return collectionIds.map((id: string) => this.database.collection(id));
  }

  private async getSubCollections(
    docRef: firestore.DocumentReference
  ): Promise<firestore.CollectionReference[]> {
    const encodedPath = docRef.path; // TODO: Encode each segment.
    const { json } = await this.restRequest(
      `documents/${encodedPath}:listCollectionIds`,
      {},
      this.baseUrl,
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
    await this.restRequest(`documents`, {}, this.baseEmulatorUrl, 'DELETE');
    return [];
  }

  async getDocuments(
    collectionRef: firestore.CollectionReference,
    options?: GetDocumentsRequest
  ): Promise<firestore.DocumentReference[]> {
    const encodedPath = collectionRef.path; // TODO: Encode each segment.

    const { json } = await this.restRequest<GetDocumentsResponse>(
      `documents/${encodedPath}`,
      { ...options },
      this.baseUrl,
      'GET'
    );
    const { documents } = json;
    return documents.map(doc => collectionRef.firestore.doc(doc.name));
  }
}

interface GetDocumentsRequest {
  'mask.fieldPaths'?: string;
  pageSize?: number;
  showMissing?: boolean;
}

interface GetDocumentsResponse {
  documents: Document[];
}

interface Document {
  name: string;
  createTime: string;
  updateTime: string;
}
