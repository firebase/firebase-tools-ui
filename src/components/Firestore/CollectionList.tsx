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
import firebase from 'firebase';
import React, { useState } from 'react';
import { NavLink, useHistory, useRouteMatch } from 'react-router-dom';
import { useFirestore } from 'reactfire';

import {
  AddCollectionDialog,
  AddCollectionDialogValue,
} from './dialogs/AddCollectionDialog';
import {
  useRootCollections,
  useSubCollections,
} from './FirestoreEmulatedApiProvider';
import { useAutoSelect } from './useAutoSelect';

export interface Props {
  collections: firebase.firestore.CollectionReference[];
  reference?: firebase.firestore.DocumentReference;
}

export const RootCollectionList: React.FC = () => {
  const rootCollections = useRootCollections();
  return <CollectionList collections={rootCollections} />;
};

export const SubCollectionList: React.FC<{
  reference: firebase.firestore.DocumentReference;
}> = ({ reference }) => {
  const subCollections = useSubCollections(reference);
  return <CollectionList collections={subCollections} reference={reference} />;
};

const CollectionList: React.FC<Props> = ({ collections, reference }) => {
  const { url } = useRouteMatch()!;
  const history = useHistory();
  const firestore = useFirestore();
  const redirectIfAutoSelectable = useAutoSelect(collections);

  const [isAddCollectionDialogOpen, setAddCollectionDialogOpen] = useState(
    false
  );

  const addCollection = async (value: AddCollectionDialogValue | null) => {
    if (value?.collectionId && value?.document.id) {
      const ref = reference || firestore;
      const newCollection = ref.collection(value.collectionId);
      await newCollection.doc(value.document.id).set(value.document.data);

      // Redirect to the new collection
      const encodedCollectionId = encodeURIComponent(value.collectionId);
      if (reference) {
        const encodedReferencePath = reference.path
          .split('/')
          .map(uri => encodeURIComponent(uri))
          .join('/');
        history.push(
          `/firestore/${encodedReferencePath}/${encodedCollectionId}`
        );
      } else {
        history.push(`/firestore/${encodedCollectionId}`);
      }
    }
  };

  return (
    <div className="Firestore-CollectionList" data-testid="collection-list">
      {redirectIfAutoSelectable}

      {isAddCollectionDialogOpen && (
        <AddCollectionDialog
          documentRef={reference}
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
            <CollectionListItem
              key={coll.id}
              collectionId={coll.id}
              routeMatchUrl={url}
            />
          ))}
      </List>
    </div>
  );
};

export const CollectionListItem: React.FC<{
  collectionId: string;
  routeMatchUrl: string;
}> = ({ collectionId, routeMatchUrl }) => {
  return (
    <ListItem
      key={collectionId}
      className="Firestore-List-Item"
      tag={NavLink}
      to={`${routeMatchUrl}/${encodeURIComponent(collectionId)}`}
      activeClassName="mdc-list-item--activated"
      data-testid="firestore-collection-list-item"
    >
      {collectionId}
    </ListItem>
  );
};
