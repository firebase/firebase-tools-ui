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

export interface Props {
  reference?: firestore.DocumentReference;
  snapshot?: firestore.DocumentSnapshot;
}

export const Document: React.FC<Props> = ({ reference, snapshot }) => {
  const { url } = useRouteMatch()!;
  const api = useApi();

  return (
    <>
      <div className="Firestore-Document">
        <div className="Firstore-Document-Preview">
          <Typography use="body1">
            <Icon icon="insert_drive_file" /> {reference && reference.id}
          </Typography>
          <div>{snapshot && <DocumentPreview snapshot={snapshot} />}</div>
        </div>
        <CollectionList reference={reference} />
      </div>

      <Route
        path={`${url}/:id`}
        render={({ match }: any) => (
          <Collection
            collection={
              reference
                ? reference.collection(match.params.id)
                : api.database.collection(match.params.id)
            }
          />
        )}
      ></Route>
    </>
  );
};

export default Document;
