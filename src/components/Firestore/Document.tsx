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

import { Icon } from '@rmwc/icon';
import { IconButton } from '@rmwc/icon-button';
import { ListDivider } from '@rmwc/list';
import { MenuItem, SimpleMenu } from '@rmwc/menu';
import {
  CollectionReference,
  DocumentReference,
  collection,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import React, { Suspense, useState } from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import { useFirestore } from 'reactfire';

import { CopyButton } from '../common/CopyButton';
import { FirestoreIcon } from '../common/icons';
import { Spinner } from '../common/Spinner';
import Collection, { CollectionLoading } from './Collection';
import { RootCollectionList, SubCollectionList } from './CollectionList';
import { DeleteDocumentDialog } from './dialogs/DeleteDocumentDialog';
import { promptDeleteDocumentFields } from './dialogs/deleteDocumentFields';
import DocumentPreview from './DocumentPreview';
import { useRecursiveDelete } from './FirestoreEmulatedApiProvider';
import PanelHeader from './PanelHeader';

const Doc: React.FC<
  React.PropsWithChildren<{
    id: string;
    collectionById: (id: string) => CollectionReference;
    children: React.ReactNode;
  }>
> = ({ collectionById, children }) => {
  const { url } = useRouteMatch()!;
console.log("Doc collectionById" + JSON.stringify(collectionById))
  return (
    <>
      <div className="Firestore-Document">{children}</div>

      <Route
        path={`${url}/:id`}
        render={({ match }: any) => {
          return (
            <Suspense
              fallback={
                <CollectionLoading
                  collection={collectionById(
                    decodeURIComponent(match.params.id)
                  )}
                />
              }
            >
              <Collection
                collection={collectionById(decodeURIComponent(match.params.id))}
              />
            </Suspense>
          );
        }}
      ></Route>
    </>
  );
};

/** Root node */
export const Root: React.FC<React.PropsWithChildren<unknown>> = () => {
  const firestore = useFirestore();
console.log("down here in document, firestore ref: " + JSON.stringify(firestore));
  return (
    <Doc id={'Root'} collectionById={(id: string) => collection(firestore, id)}>
      <PanelHeader id="Root" icon={<FirestoreIcon />} />
      <Suspense fallback={<Spinner message="Loading collections" />}>
        <RootCollectionList />
      </Suspense>
    </Doc>
  );
};

/** Document node */
export const Document: React.FC<
  React.PropsWithChildren<{
    reference: DocumentReference;
  }>
> = ({ reference }) => {
  console.log("reference for Document: " + JSON.stringify(reference));

  const recursiveDelete = useRecursiveDelete();
  const [isDeleteDocumentDialogOpen, setDeleteDocumentDialogOpen] =
    useState(false);

  const handleDeleteFields = async () => {
    const shouldDelete = await promptDeleteDocumentFields(reference);
    shouldDelete && setDoc(reference, {});
  };

  const menuItems = ['Delete document', 'Delete all fields'];

  return (
    <Doc
      id={reference.id}
      collectionById={(id: string) => collection(reference, id)}
    >
      {isDeleteDocumentDialogOpen && (
        <DeleteDocumentDialog
          documentRef={reference}
          open={isDeleteDocumentDialogOpen}
          onConfirm={({ recursive }) =>
            recursive ? recursiveDelete(reference) : deleteDoc(reference)
          }
          onClose={() => setDeleteDocumentDialogOpen(false)}
        />
      )}
      <PanelHeader
        id={reference.id}
        icon={<Icon icon={{ icon: 'insert_drive_file', size: 'small' }} />}
      >
        <CopyButton textToCopy={reference.id} label="Copy document ID" />
        <SimpleMenu
          handle={<IconButton icon="more_vert" label="Menu" />}
          renderToPortal
          onSelect={(evt) => {
            switch (menuItems[evt.detail.index]) {
              case 'Delete document':
                setDeleteDocumentDialogOpen(true);
                break;

              case 'Delete all fields':
                handleDeleteFields();
                break;
            }
          }}
        >
          {menuItems.map((menuItemText) => {
            return <MenuItem>{menuItemText}</MenuItem>;
          })}
        </SimpleMenu>
      </PanelHeader>

      <Suspense fallback={<Spinner message="Loading collections" />}>
        <SubCollectionList reference={reference} />
      </Suspense>
      <ListDivider tag="div" />
      <Suspense fallback={<Spinner message="Loading document" />}>
        <DocumentPreview reference={reference} />
      </Suspense>
    </Doc>
  );
};
