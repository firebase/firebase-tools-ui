/**
 * Copyright 2020 Google LLC
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

import { Button } from '@rmwc/button';
import { List, ListItem } from '@rmwc/list';
import { Typography } from '@rmwc/typography';
import firebase from 'firebase';
import React, { useState } from 'react';
import { useFirestoreDoc } from 'reactfire';

import { FirestoreMap } from '../models';
import { compareFirestoreKeys } from '../utils';
import { addFieldToMissingDocument, updateField } from './api';
import { EditableFieldPreview } from './FieldPreview';
import InlineEditor from './InlineEditor';
import { DocumentProvider } from './store';

export interface Props {
  reference: firebase.firestore.DocumentReference;
  maxSummaryLen?: number;
}

const DocumentPreview: React.FC<Props> = ({
  reference,
  maxSummaryLen = 20,
}) => {
  const snapshot = useFirestoreDoc(reference, { suspense: true }).data;
  const [isAddingField, setIsAddingField] = useState(false);
  const docExists = snapshot.exists;
  const data = docExists ? (snapshot.data() as FirestoreMap) : {};
  const docEmpty = docExists && Object.keys(data).length === 0;

  return (
    <>
      <DocumentProvider value={data || {}}>
        <List
          dense
          className="List-Actions Firestore-Document-Fields"
          tag="div"
        >
          {/* Actions */}
          <ListItem
            className="list-button"
            tag={Button}
            label="Add field"
            {...{ dense: true, icon: 'add' }} // types get confused
            onClick={() => setIsAddingField(true)}
          ></ListItem>

          {isAddingField && (
            <InlineEditor
              value={{ '': '' }}
              onCancel={() => {
                setIsAddingField(false);
              }}
              onSave={async (key, value) => {
                if (!docExists) {
                  await addFieldToMissingDocument(reference, key, value);
                } else {
                  updateField(reference, data, [key], value);
                }
                setIsAddingField(false);
              }}
              areRootKeysMutable={true}
              firestore={reference.firestore}
            />
          )}

          {docExists && !docEmpty && (
            <div className="Firestore-Field-List">
              {Object.keys(data)
                .sort(compareFirestoreKeys)
                .map((name) => (
                  <EditableFieldPreview
                    key={name}
                    path={[name]}
                    documentRef={reference}
                    maxSummaryLen={maxSummaryLen}
                  />
                ))}
            </div>
          )}
          {!docExists && (
            <DocumentWarning>
              This document does not exist, it will not appear in queries or
              snapshots
            </DocumentWarning>
          )}
          {docEmpty && (
            <DocumentWarning>This document has no data</DocumentWarning>
          )}
        </List>
      </DocumentProvider>
    </>
  );
};

const DocumentWarning: React.FC<{}> = ({ children }) => (
  <Typography
    theme="secondary"
    use="body2"
    className="Firestore-Document-Warning"
  >
    <i>{children}</i>
  </Typography>
);

export default DocumentPreview;
