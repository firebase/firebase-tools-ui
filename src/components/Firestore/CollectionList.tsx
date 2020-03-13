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
import { useRouteMatch, NavLink } from 'react-router-dom';
import { List, ListItem } from '@rmwc/list';
import { Button } from '@rmwc/button';

import './index.scss';
import { useApi } from './ApiContext';
import DatabaseApi from './api';

export interface Props {
  reference?: firestore.DocumentReference;
}

export const CollectionList: React.FC<Props> = ({ reference }) => {
  const { url } = useRouteMatch()!;
  const api = useApi();
  const collections = useCollections(api, reference);

  return (
    <div className="Firestore-CollectionList" data-testid="collection-list">
      {/* Actions */}
      <List dense className="List-Actions">
        <ListItem
          tag={props => (
            <Button dense label="Start collection" icon="add" {...props} />
          )}
        ></ListItem>
      </List>

      <List dense>
        {collections &&
          collections.map(coll => (
            <ListItem
              key={coll.id}
              className="Firestore-List-Item"
              tag={props => (
                <NavLink
                  to={`${url}/${coll.id}`}
                  activeClassName="mdc-list-item--activated"
                  {...props}
                />
              )}
            >
              {coll.id}
            </ListItem>
          ))}
      </List>
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
