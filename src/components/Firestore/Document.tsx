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
import firebase from 'firebase';
import React, { Suspense } from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import { useFirestore } from 'reactfire';

import { CopyButton } from '../common/CopyButton';
import { FirestoreIcon } from '../common/icons';
import { Spinner } from '../common/Spinner';
import Collection, { CollectionLoading } from './Collection';
import { RootCollectionList, SubCollectionList } from './CollectionList';
import { promptDeleteDocument } from './dialogs/deleteDocument';
import { promptDeleteDocumentFields } from './dialogs/deleteDocumentFields';
import DocumentPreview from './DocumentPreview';
import PanelHeader from './PanelHeader';

const Doc: React.FC<{
  id: string;
  collectionById: (id: string) => firebase.firestore.CollectionReference;
  children: React.ReactNode;
}> = ({ collectionById, children }) => {
  const { url } = useRouteMatch()!;

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
export const Root: React.FC = () => {
  const firestore = useFirestore();

  return (
    <Doc id={'Root'} collectionById={(id: string) => firestore.collection(id)}>
      <PanelHeader id="Root" icon={<FirestoreIcon />} />
      <Suspense fallback={<Spinner message="Loading collections" />}>
        <RootCollectionList />
      </Suspense>
    </Doc>
  );
};

/** Document node */
export const Document: React.FC<{
  reference: firebase.firestore.DocumentReference;
}> = ({ reference }) => {
  const handleDeleteDocument = async () => {
    const shouldDelete = await promptDeleteDocument(reference);
    // TODO: recursively delete sub documents
    shouldDelete && reference.delete();
  };

  const handleDeleteFields = async () => {
    const shouldDelete = await promptDeleteDocumentFields(reference);
    shouldDelete && reference.set({});
  };

  return (
    <Doc
      id={reference.id}
      collectionById={(id: string) => reference.collection(id)}
    >
      <PanelHeader
        id={reference.id}
        icon={<Icon icon={{ icon: 'insert_drive_file', size: 'small' }} />}
      >
        <CopyButton textToCopy={reference.id} label="Copy document ID" />
        <SimpleMenu handle={<IconButton icon="more_vert" />} renderToPortal>
          <MenuItem onClick={handleDeleteDocument}>Delete document</MenuItem>
          <MenuItem onClick={handleDeleteFields}>Delete all fields</MenuItem>
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
