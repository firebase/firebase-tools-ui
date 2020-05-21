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
import { Icon } from '@rmwc/icon';
import { IconButton } from '@rmwc/icon-button';
import { List, ListItem } from '@rmwc/list';
import { MenuSurface, MenuSurfaceAnchor } from '@rmwc/menu';
import { firestore } from 'firebase';
import React, { useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { NavLink, Redirect, Route, useRouteMatch } from 'react-router-dom';

import styles from './Collection.module.scss';
import { CollectionFilter } from './CollectionFilter';
import {
  AddDocumentDialog,
  AddDocumentDialogValue,
} from './dialogs/AddDocumentDialog';
import { Document } from './Document';
import {
  CollectionFilter as CollectionFilterType,
  isMultiValueCollectionFilter,
  isSingleValueCollectionFilter,
  isSortableCollectionFilter,
} from './models';
import PanelHeader from './PanelHeader';
import { useCollectionFilter } from './store';
import { useAutoSelect } from './useAutoSelect';

const NO_DOCS: firestore.QueryDocumentSnapshot<firestore.DocumentData>[] = [];

export interface Props {
  collection: firestore.CollectionReference;
}

export const Collection: React.FC<Props> = ({ collection }) => {
  const [newDocumentId, setNewDocumentId] = useState<string>();
  const collectionFilter = useCollectionFilter(collection.path);
  const filteredCollection = applyCollectionFilter(
    collection,
    collectionFilter
  );
  const [collectionSnapshot, loading, error] = useCollection(
    filteredCollection
  );

  const { url } = useRouteMatch()!;
  // TODO: Fetch missing documents (i.e. nonexistent docs with subcollections).
  const docs = collectionSnapshot ? collectionSnapshot.docs : NO_DOCS;
  const redirectIfAutoSelectable = useAutoSelect(docs);

  const addDocument = async (value: AddDocumentDialogValue | null) => {
    if (value && value.id) {
      await collection.doc(value.id).set(value.data);
      setNewDocumentId(value.id);
    }
  };

  if (error) return <></>;
  if (!loading && redirectIfAutoSelectable)
    return <>{redirectIfAutoSelectable}</>;
  if (newDocumentId) return <Redirect to={`${url}/${newDocumentId}`} />;

  return (
    <CollectionPresentation
      collection={collection}
      collectionFilter={collectionFilter}
      addDocument={addDocument}
      docs={docs}
      url={url}
    />
  );
};

interface CollectionPresentationProps {
  collection: firestore.CollectionReference<firestore.DocumentData>;
  collectionFilter: ReturnType<typeof useCollectionFilter>;
  addDocument: (value: AddDocumentDialogValue | null) => Promise<void>;
  docs: firestore.QueryDocumentSnapshot<firestore.DocumentData>[];
  url: string;
}

export const CollectionPresentation: React.FC<CollectionPresentationProps> = ({
  collection,
  collectionFilter,
  addDocument,
  docs,
  url,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddDocumentDialogOpen, setAddDocumentDialogOpen] = useState(false);

  return (
    <>
      <div className="Firestore-Collection">
        <PanelHeader
          id={collection.id}
          icon={<Icon icon={{ icon: 'collections_bookmark', size: 'small' }} />}
        >
          <MenuSurfaceAnchor>
            <MenuSurface
              open={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
            >
              {isFilterOpen && (
                <CollectionFilter
                  className={styles['query-panel']}
                  path={collection.path}
                  onClose={() => setIsFilterOpen(false)}
                />
              )}
            </MenuSurface>

            <div className={collectionFilter && styles.badge}>
              <IconButton
                icon="filter_list"
                label="Filter documents in this collection"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              />
            </div>
          </MenuSurfaceAnchor>
        </PanelHeader>

        {isAddDocumentDialogOpen && (
          <AddDocumentDialog
            collectionRef={collection}
            open={isAddDocumentDialogOpen}
            onValue={addDocument}
            onClose={() => setAddDocumentDialogOpen(false)}
          />
        )}
        <List dense className="List-Actions" tag="div">
          <ListItem
            className="list-button"
            tag={Button}
            label="Add document"
            {...{ dense: true, icon: 'add' }} // types get confused
            onClick={() => setAddDocumentDialogOpen(true)}
          ></ListItem>
        </List>

        <List dense className="Firestore-Document-List" tag="div">
          {docs.map(doc => (
            <ListItem
              key={doc.ref.id}
              className="Firestore-List-Item"
              tag={NavLink}
              to={`${url}/${doc.ref.id}`}
              activeClassName="mdc-list-item--activated"
            >
              {doc.ref.id}
            </ListItem>
          ))}
        </List>
      </div>
      <Route
        path={`${url}/:id`}
        render={({ match }: any) => {
          const docRef = collection.doc(match.params.id);
          return <Document reference={docRef} />;
        }}
      ></Route>
    </>
  );
};

function applyCollectionFilter(
  collection: firestore.Query<firestore.DocumentData>,
  collectionFilter?: CollectionFilterType
): firestore.Query<firestore.DocumentData> {
  let filteredCollection = collection;
  if (collectionFilter && isSingleValueCollectionFilter(collectionFilter)) {
    filteredCollection = filteredCollection.where(
      collectionFilter.field,
      collectionFilter.operator,
      collectionFilter.value
    );
  }
  if (collectionFilter && isMultiValueCollectionFilter(collectionFilter)) {
    filteredCollection = filteredCollection.where(
      collectionFilter.field,
      collectionFilter.operator,
      collectionFilter.values
    );
  }
  if (collectionFilter && isSortableCollectionFilter(collectionFilter)) {
    filteredCollection = filteredCollection.orderBy(
      collectionFilter.field,
      collectionFilter.sort
    );
  }
  return filteredCollection;
}

export default Collection;
