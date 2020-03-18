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
import { firestore } from 'firebase';
import React from 'react';
import { Route, useRouteMatch } from 'react-router-dom';

import { useApi } from './ApiContext';
import Collection from './Collection';
import CollectionList from './CollectionList';
import { promptDeleteDocument } from './dialogs/deleteDocument';
import { promptDeleteDocumentFields } from './dialogs/deleteDocumentFields';
import DocumentPreview from './DocumentPreview';
import FirestoreLogo from './FirestoreLogo';
import PanelHeader from './PanelHeader';

const Doc: React.FC<{
  id: string;
  collectionById: (id: string) => firestore.CollectionReference;
  children: React.ReactNode;
}> = ({ collectionById, children }) => {
  const { url } = useRouteMatch()!;

  return (
    <>
      <div className="Firestore-Document">{children}</div>

      <Route
        path={`${url}/:id`}
        render={({ match }: any) => (
          <Collection collection={collectionById(match.params.id)} />
        )}
      ></Route>
    </>
  );
};

/** Root node */
export const Root: React.FC = () => {
  const api = useApi();

  return (
    <Doc
      id={'Root'}
      collectionById={(id: string) => api.database.collection(id)}
    >
      <PanelHeader id="Root" icon={<FirestoreLogo size="small" />} />
      <CollectionList />
    </Doc>
  );
};

/** Document node */
export const Document: React.FC<{ reference: firestore.DocumentReference }> = ({
  reference,
}) => {
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
        <SimpleMenu handle={<IconButton icon="more_vert" />}>
          <MenuItem onClick={handleDeleteDocument}>Delete document</MenuItem>
          <MenuItem onClick={handleDeleteFields}>Delete all fields</MenuItem>
        </SimpleMenu>
      </PanelHeader>

      <CollectionList reference={reference} />
      <ListDivider />
      <DocumentPreview reference={reference} />
    </Doc>
  );
};
