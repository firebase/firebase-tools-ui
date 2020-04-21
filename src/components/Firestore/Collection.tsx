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
import { NavLink, Route, useRouteMatch } from 'react-router-dom';

import * as actions from './actions';
import styles from './Collection.module.scss';
import { CollectionFilter } from './CollectionFilter';
import {
  AddDocumentDialog,
  AddDocumentDialogValue,
} from './dialogs/AddDocumentDialog';
import { Document } from './Document';
import PanelHeader from './PanelHeader';
import { useCollectionFilter } from './store';
import { useAutoSelect } from './useAutoSelect';

const NO_DOCS: firestore.QueryDocumentSnapshot<firestore.DocumentData>[] = [];

export interface Props {
  collection: firestore.CollectionReference;
}

export const Collection: React.FC<Props> = ({ collection }) => {
  const collectionFilter = useCollectionFilter(collection.path);
  const filteredCollection = collection;
  // const filteredCollection = collectionFilter
  //   ? collection.where(
  //       collectionFilter.field,
  //       '==',
  //       collectionFilter.condition.entries[0]
  //     )
  //   : collection;

  const [collectionSnapshot, loading, error] = useCollection(
    filteredCollection
  );

  const [isAddDocumentDialogOpen, setAddDocumentDialogOpen] = useState(false);
  // TODO: DO NOT SUBMIT: Default to false before Submitting
  const [open, setOpen] = useState(true);

  const { url } = useRouteMatch()!;
  // TODO: Fetch missing documents (i.e. nonexistent docs with subcollections).
  const docs = collectionSnapshot ? collectionSnapshot.docs : NO_DOCS;
  const redirectIfAutoSelectable = useAutoSelect(docs);

  const addDocument = async (value: AddDocumentDialogValue | null) => {
    if (value && value.id) {
      await collection.doc(value.id).set(value.data);
    }
  };

  if (error) return <></>;

  return (
    <>
      {!loading && redirectIfAutoSelectable}
      <div className="Firestore-Collection">
        <PanelHeader
          id={collection.id}
          icon={<Icon icon={{ icon: 'collections_bookmark', size: 'small' }} />}
        >
          <MenuSurfaceAnchor>
            <MenuSurface open={open} onClose={evt => setOpen(false)}>
              {!loading && open && (
                <CollectionFilter
                  className={styles['query-panel']}
                  path={collection.path}
                  onClose={() => setOpen(false)}
                />
              )}
            </MenuSurface>

            <IconButton
              icon="filter_list"
              label="Filter documents in this collection"
              onClick={() => setOpen(!open)}
            />
          </MenuSurfaceAnchor>
        </PanelHeader>

        {/* Actions */}
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

export default Collection;
