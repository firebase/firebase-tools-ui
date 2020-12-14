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
import firebase from 'firebase';
import get from 'lodash.get';
import React, { useState } from 'react';
import { Route, useHistory, useRouteMatch } from 'react-router-dom';
import { useFirestoreCollection } from 'reactfire';

import { CopyButton } from '../common/CopyButton';
import { Spinner } from '../common/Spinner';
import styles from './Collection.module.scss';
import { CollectionFilter } from './CollectionFilter';
import {
  AddDocumentDialog,
  AddDocumentDialogValue,
} from './dialogs/AddDocumentDialog';
import { Document } from './Document';
import DocumentListItem from './DocumentListItem';
import { useMissingDocuments } from './FirestoreEmulatedApiProvider';
import {
  CollectionFilter as CollectionFilterType,
  MissingDocument,
  isMultiValueCollectionFilter,
  isSingleValueCollectionFilter,
  isSortableCollectionFilter,
} from './models';
import PanelHeader from './PanelHeader';
import { useCollectionFilter } from './store';
import { useAutoSelect } from './useAutoSelect';

const NO_DOCS: firebase.firestore.QueryDocumentSnapshot<
  firebase.firestore.DocumentData
>[] = [];

export interface Props {
  collection: firebase.firestore.CollectionReference;
}

export function withCollectionState(
  Presentation: React.ComponentType<CollectionPresentationProps>
): React.ComponentType<Props> {
  return ({ collection }) => {
    const [newDocumentId, setNewDocumentId] = useState<string>();
    const collectionFilter = useCollectionFilter(collection.path);
    const filteredCollection = applyCollectionFilter(
      collection,
      collectionFilter
    );
    const collectionSnapshot = useFirestoreCollection<unknown>(
      filteredCollection,
      {
        suspense: true,
      }
    );
    const history = useHistory();

    const { url } = useRouteMatch()!;

    const missingDocs = useMissingDocuments(collection);

    const docs = collectionSnapshot.data.docs.length
      ? collectionSnapshot.data.docs
      : NO_DOCS;
    const redirectIfAutoSelectable = useAutoSelect(docs);

    const addDocument = async (value: AddDocumentDialogValue | null) => {
      if (value && value.id) {
        await collection.doc(value.id).set(value.data);
        setNewDocumentId(value.id);
      }
    };

    if (newDocumentId) {
      history.push(`${url}/${encodeURIComponent(newDocumentId)}`);
      setNewDocumentId('');
      return null;
    }

    if (redirectIfAutoSelectable) {
      return <>{redirectIfAutoSelectable}</>;
    }

    return (
      <Presentation
        collection={collection}
        collectionFilter={collectionFilter}
        addDocument={addDocument}
        docs={docs}
        missingDocs={missingDocs}
        url={url}
      />
    );
  };
}

// TODO: create a CollectionSkeleton that the loading+loaded state can utilize
export const CollectionLoading: React.FC<{
  collection: firebase.firestore.CollectionReference<
    firebase.firestore.DocumentData
  >;
}> = ({ collection }) => (
  <div className="Firestore-Collection">
    <PanelHeader
      id={collection.id}
      icon={<Icon icon={{ icon: 'collections_bookmark', size: 'small' }} />}
    />
    <Spinner message="Loading collection" />
  </div>
);

interface CollectionPresentationProps {
  collection: firebase.firestore.CollectionReference<
    firebase.firestore.DocumentData
  >;
  collectionFilter: ReturnType<typeof useCollectionFilter>;
  addDocument: (value: AddDocumentDialogValue | null) => Promise<void>;
  docs: firebase.firestore.QueryDocumentSnapshot<
    firebase.firestore.DocumentData
  >[];
  missingDocs: MissingDocument[];
  url: string;
}

export const CollectionPresentation: React.FC<CollectionPresentationProps> = ({
  collection,
  collectionFilter,
  addDocument,
  docs,
  missingDocs,
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
              <CopyButton
                textToCopy={collection.id}
                label="Copy collection ID"
              />
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

        <List
          dense
          className="Firestore-Document-List"
          tag="div"
          twoLine={
            collectionFilter && isSortableCollectionFilter(collectionFilter)
          }
        >
          {docs.map(doc => (
            <DocumentListItem
              key={doc.ref.id}
              url={url}
              docId={doc.ref.id}
              queryFieldValue={
                collectionFilter && isSortableCollectionFilter(collectionFilter)
                  ? get(doc.data(), collectionFilter.field)
                  : undefined
              }
            />
          ))}

          {missingDocs.map((doc: { path: string }) => {
            const id = doc.path.replace(collection.path, '').split('/')[1];

            return (
              <DocumentListItem
                missing
                key={id}
                url={url}
                docId={id}
                queryFieldValue={undefined}
              />
            );
          })}
        </List>
      </div>
      <Route
        path={`${url}/:id`}
        render={({ match }: any) => {
          const docId = decodeURIComponent(match.params.id);
          const docRef = collection.doc(docId);
          return <Document reference={docRef} />;
        }}
      ></Route>
    </>
  );
};

function applyCollectionFilter(
  collection: firebase.firestore.Query<firebase.firestore.DocumentData>,
  collectionFilter?: CollectionFilterType
): firebase.firestore.Query<firebase.firestore.DocumentData> {
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

export const Collection = withCollectionState(CollectionPresentation);

export default Collection;
