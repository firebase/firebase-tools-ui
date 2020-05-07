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

import './index.scss';

import { Button } from '@rmwc/button';
import { List, ListItem } from '@rmwc/list';
import { firestore } from 'firebase';
import React, { useEffect, useState } from 'react';
import { NavLink, useHistory, useRouteMatch } from 'react-router-dom';

import DatabaseApi from './api';
import { useCollectionsNew } from './Api-NEW';
import { useApi } from './ApiContext';
import {
  AddCollectionDialog,
  AddCollectionDialogValue,
} from './dialogs/AddCollectionDialog';
import { useAutoSelect } from './useAutoSelect';

export interface Props {
  reference?: firestore.DocumentReference;
}

export const CollectionList: React.FC<Props> = ({ reference }) => {
  const { url } = useRouteMatch()!;
  const api = useApi();
  const history = useHistory();
  // const restCollections = useCollections(api, reference);
  const restCollections = useCollectionsNew(reference);
  // const rootCollections = useRootCollections();
  const [collections, setCollections] = useState(restCollections);
  const redirectIfAutoSelectable = useAutoSelect(collections);

  useEffect(() => {
    // Update the current list of collections whenever the rest-query resolves
    // with CollectionRefs
    setCollections(restCollections);
  }, [restCollections]);

  const [isAddCollectionDialogOpen, setAddCollectionDialogOpen] = useState(
    false
  );

  const addCollection = async (value: AddCollectionDialogValue | null) => {
    if (value && value.collectionId && value.document.id) {
      const ref = reference || api.database;
      const newCollection = ref.collection(value.collectionId);

      await newCollection.doc(value.document.id).set(value.document.data);

      // Append to the current collection-list because the hook is not triggered
      setCollections([...collections, newCollection]);

      // Redirect to the new collection
      if (reference) {
        history.push(`/firestore/${reference.path}/${value.collectionId}`);
      } else {
        history.push(`/firestore/${value.collectionId}`);
      }
    }
  };

  return (
    <div className="Firestore-CollectionList" data-testid="collection-list">
      {redirectIfAutoSelectable}

      {isAddCollectionDialogOpen && (
        <AddCollectionDialog
          documentRef={reference}
          api={api}
          open={isAddCollectionDialogOpen}
          onValue={addCollection}
          onClose={() => setAddCollectionDialogOpen(false)}
        />
      )}
      {/* Actions */}
      <List dense className="List-Actions" tag="div">
        <ListItem
          className="list-button"
          tag={Button}
          {...{ dense: true, icon: 'add' }} // types get confused
          label="Start collection"
          onClick={() => setAddCollectionDialogOpen(true)}
        ></ListItem>
      </List>

      <List dense tag="div">
        {collections &&
          collections.map(coll => (
            <ListItem
              key={coll.id}
              className="Firestore-List-Item"
              tag={NavLink}
              to={`${url}/${coll.id}`}
              activeClassName="mdc-list-item--activated"
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
