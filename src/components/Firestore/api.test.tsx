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

import DatabaseApi from './api';
import { initFirestore } from '../../firebase';
import {
  fakeCollectionReference,
  fakeDocumentReference,
} from './testing/models';

jest.mock('../../firebase');

function makeApi({
  projectId = 'project_id',
  databaseId = 'database_id',
  config = {},
} = {}): DatabaseApi {
  initFirestore.mockReturnValue([
    {
      collection: id => fakeCollectionReference({ id }),
    },
    { cleanup: {} },
  ]);
  return new DatabaseApi(projectId, databaseId, config);
}

beforeEach(() => {
  fetch.resetMocks();
});

it('requests root collections', async () => {
  const api = makeApi();

  fetch.doMockIf(
    new RegExp(
      '/v1/projects/project_id/databases/database_id/documents:listCollectionIds'
    )
  );
  fetch.mockResponseOnce(JSON.stringify({ collectionIds: ['foo', 'bar'] }));
  const collectionIds = (await api.getCollections()).map(c => c.id);
  expect(collectionIds).toEqual(['foo', 'bar']);
});

it('requests document-level collections', async () => {
  const api = makeApi();

  fetch.doMockIf(
    new RegExp(
      '/v1/projects/project_id/databases/database_id/documents/doc_path:listCollectionIds'
    )
  );
  fetch.mockResponseOnce(JSON.stringify({ collectionIds: ['foo', 'bar'] }));

  const documentReference = fakeDocumentReference({ path: 'doc_path' });
  const collectionIds = (await api.getCollections(documentReference)).map(
    c => c.id
  );
  expect(collectionIds).toEqual(['foo', 'bar']);
});

it('requests nuking everything', async () => {
  const api = makeApi();

  fetch.doMockIf(
    new RegExp(
      'emulator/v1/projects/project_id/databases/database_id/documents'
    )
  );
  fetch.mockResponseOnce(JSON.stringify([]));

  expect(await api.nukeDocuments()).toEqual([]);
});
