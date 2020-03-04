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
import DatabaseApi from './api';
import { Typography } from '@rmwc/typography';
import { Icon } from '@rmwc/icon';

import CollectionList from './CollectionList';
import DocumentPreview from './DocumentPreview';

export interface Props {
  reference: firestore.DocumentReference;
  snapshot?: firestore.DocumentSnapshot;
  api: DatabaseApi;
}

export const Document: React.FC<Props> = ({ reference, snapshot, api }) => {
  return (
    <div className="Document-Document">
      <div>
        <Typography use="body1">
          <Icon icon="insert_drive_file" /> {reference.id}
        </Typography>
        <div>
          {snapshot && <DocumentPreview snapshot={snapshot} />}
          <CollectionList api={api} reference={reference} />
        </div>
      </div>
    </div>
  );
};

export default Document;
