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

import React, { useState, useEffect } from 'react';
import { firestore } from 'firebase';
import DatabaseApi from './api';
import { Route, useRouteMatch, Link } from 'react-router-dom';

import Collection from './Collection';
import './index.scss';

export interface Props {
  api: DatabaseApi;
  reference?: firestore.DocumentReference;
}

export const CollectionList: React.FC<Props> = ({ api, reference }) => {
  const { url } = useRouteMatch()!;
  const collections = useCollections(api, reference);

  return (
    <div className="CollectionList" data-testid="collection-list">
      <div>
        {!collections ? (
          <p>Loading collections...</p>
        ) : (
          <ul>
            {collections.map(coll => (
              <li key={coll.id}>
                <Link to={`${url}/${coll.id}`}>{coll.id}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Route
        path={`${url}/:id`}
        render={({ match }: any) => (
          <Collection
            api={api}
            collection={
              reference
                ? reference.collection(match.params.id)
                : api.database.collection(match.params.id)
            }
          />
        )}
      ></Route>
    </div>
  );
};

function useCollections(
  api: DatabaseApi,
  documentRef?: firestore.DocumentReference
): firestore.CollectionReference[] | null {
  const [collections, setCollections] = useState<
    firestore.CollectionReference[] | null
  >(null);

  useEffect(() => {
    async function fetchCollections() {
      const collections = await api.getCollections(documentRef);
      setCollections(collections);
    }
    fetchCollections();
  }, [api, documentRef]);

  return collections;
}

export default CollectionList;
