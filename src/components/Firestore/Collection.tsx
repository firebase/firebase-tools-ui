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
import React, { useEffect, useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import {
  NavLink,
  Redirect,
  Route,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';

import {
  AddDocumentDialog,
  AddDocumentDialogValue,
} from './dialogs/AddDocumentDialog';
import { Document } from './Document';
import PanelHeader from './PanelHeader';

export interface Props {
  collection: firestore.CollectionReference;
}

export const Collection: React.FC<Props> = ({ collection }) => {
  const [collectionSnapshot, loading, error] = useCollection(collection);
  const [isAddDocumentDialogOpen, setAddDocumentDialogOpen] = useState(false);
  const [autoSelect, setRedirectDoc] = useState<string | undefined>(undefined);

  const { url } = useRouteMatch()!;
  const { pathname } = useLocation();

  useEffect(() => {
    const docs = collectionSnapshot?.docs;
    const firstChild = docs?.length ? docs[0] : undefined;
    const isRootCollection = url.split('/').length === 3;
    const hasNothingSelected = url === pathname;
    const shouldSelectFirstDoc =
      isRootCollection && hasNothingSelected && !!firstChild;
    shouldSelectFirstDoc && console.log('select doc', firstChild?.id);

    setRedirectDoc(shouldSelectFirstDoc ? firstChild?.id : undefined);
  }, [collectionSnapshot, url, pathname]);

  const addDocument = async (value: AddDocumentDialogValue | null) => {
    if (value && value.id) {
      await collection.doc(value.id).set(value.data);
    }
  };

  if (loading) return <></>;
  if (error) return <></>;

  // TODO: Fetch missing documents (i.e. nonexistent docs with subcollections).
  const docs = collectionSnapshot ? collectionSnapshot.docs : [];

  return (
    <>
      {autoSelect && (
        <Route exact path={url}>
          <Redirect to={`${url}/${autoSelect}`} />
        </Route>
      )}
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
