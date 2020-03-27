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
import { List, ListItem } from '@rmwc/list';
import { firestore } from 'firebase';
import React, { useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { NavLink, Route, useRouteMatch } from 'react-router-dom';

import {
  AddDocumentDialog,
  AddDocumentDialogValue,
} from './dialogs/AddDocumentDialog';
import { Document } from './Document';
import PanelHeader from './PanelHeader';
import { useAutoSelect } from './useAutoSelect';

const NO_DOCS: firestore.QueryDocumentSnapshot<firestore.DocumentData>[] = [];

export interface Props {
  collection: firestore.CollectionReference;
}

export const Collection: React.FC<Props> = ({ collection }) => {
  const [collectionSnapshot, loading, error] = useCollection(collection);
  const [isAddDocumentDialogOpen, setAddDocumentDialogOpen] = useState(false);

  const { url } = useRouteMatch()!;
  // TODO: Fetch missing documents (i.e. nonexistent docs with subcollections).
  const docs = collectionSnapshot ? collectionSnapshot.docs : NO_DOCS;
  const redirectIfAutoSelectable = useAutoSelect(docs);

  const addDocument = async (value: AddDocumentDialogValue | null) => {
    if (value && value.id) {
      await collection.doc(value.id).set(value.data);
    }
  };

  if (loading) return <></>;
  if (error) return <></>;

  return (
    <>
      {redirectIfAutoSelectable}
      <div className="Firestore-Collection">
        <PanelHeader
          id={collection.id}
          icon={<Icon icon={{ icon: 'collections_bookmark', size: 'small' }} />}
        />

        {/* Actions */}
        {isAddDocumentDialogOpen && (
          <AddDocumentDialog
            collectionRef={collection}
            open={isAddDocumentDialogOpen}
            onValue={addDocument}
            onClose={() => setAddDocumentDialogOpen(false)}
          />
        )}
        <List dense className="List-Actions">
          <ListItem
            tag={props => (
              <Button
                dense
                label="Add document"
                icon="add"
                {...props}
                onClick={() => setAddDocumentDialogOpen(true)}
              />
            )}
          ></ListItem>
        </List>

        <List dense className="Firestore-Document-List">
          {docs.map(doc => (
            <ListItem
              key={doc.ref.id}
              className="Firestore-List-Item"
              tag={props => (
                <NavLink
                  to={`${url}/${doc.ref.id}`}
                  activeClassName="mdc-list-item--activated"
                  {...props}
                />
              )}
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
