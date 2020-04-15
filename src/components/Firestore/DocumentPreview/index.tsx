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
import { firestore } from 'firebase';
import React, { useState } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';

import { FirestoreMap } from '../models';
import { isMap } from '../utils';
import { addFieldToMissingDocument, updateField } from './api';
import FieldPreview from './FieldPreview';
import InlineEditor from './InlineEditor';
import { DocumentProvider } from './store';

export interface Props {
  reference: firestore.DocumentReference;
  maxSummaryLen?: number;
}

const DocumentPreview: React.FC<Props> = ({
  reference,
  maxSummaryLen = 20,
}) => {
  const [data, loading, error] = useDocumentData<FirestoreMap>(reference);
  const [isAddingField, setIsAddingField] = useState(false);

  if (loading) return <div>Loading document...</div>;
  if (error) return <div>Error retrieving document</div>;

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
                if (!data) {
                  await addFieldToMissingDocument(reference, key, value);
                } else {
                  updateField(reference, data, [key], value);
                }
                setIsAddingField(false);
              }}
              areRootKeysMutable={true}
            />
          )}

          {data && isMap(data) ? (
            <div className="Firestore-Field-List">
              {Object.keys(data).map(name => (
                <FieldPreview
                  key={name}
                  path={[name]}
                  documentRef={reference}
                  maxSummaryLen={maxSummaryLen}
                />
              ))}
            </div>
          ) : (
            <Typography
              theme="secondary"
              use="body2"
              className="Firestore-Document-Warning"
            >
              <i>
                This document does not exist, it will not appear in queries or
                snapshots
              </i>
            </Typography>
          )}
        </List>
      </DocumentProvider>
    </>
  );
};

export default DocumentPreview;
