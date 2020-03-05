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

import React from 'react';
import './index.scss';
import { firestore } from 'firebase';
import { Typography } from '@rmwc/typography';
import { Icon } from '@rmwc/icon';
import { Route, useRouteMatch } from 'react-router-dom';

import CollectionList from './CollectionList';
import DocumentPreview from './DocumentPreview';
import Collection from './Collection';
import { useApi } from './ApiContext';

const Doc: React.FC<{
  id: string;
  collectionById: (id: string) => firestore.CollectionReference;
  children: React.ReactNode;
}> = ({ id, collectionById, children }) => {
  const { url } = useRouteMatch()!;

  return (
    <>
      <div className="Firestore-Document">
        <div className="Firstore-Document-Header">
          <Typography use="body1">
            <Icon icon="insert_drive_file" /> {id}
          </Typography>
        </div>
        {children}
      </div>

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
      <CollectionList />
    </Doc>
  );
};

/** Document node */
export const Document: React.FC<{ reference: firestore.DocumentReference }> = ({
  reference,
}) => {
  return (
    <Doc
      id={reference.id}
      collectionById={(id: string) => reference.collection(id)}
    >
      <CollectionList reference={reference} />
      <DocumentPreview reference={reference} />
    </Doc>
  );
};
