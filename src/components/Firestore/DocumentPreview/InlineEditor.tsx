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

import { Card, CardActionButton, CardActionButtons } from '@rmwc/card';
import { Elevation } from '@rmwc/elevation';
import React, { useState } from 'react';

import DocumentEditor from '../DocumentEditor';
import { FieldType, FirestoreAny, FirestoreMap } from '../models';
import { getFieldType, lastFieldName } from '../utils';

export const supportedFieldTypes = new Set([
  FieldType.ARRAY,
  FieldType.BOOLEAN,
  FieldType.MAP,
  FieldType.NULL,
  FieldType.NUMBER,
  FieldType.STRING,
  FieldType.TIMESTAMP,
  // TODO: FieldType.GEOPOINT,
  // TODO: FieldType.REFERENCE,
]);

export function supportsEditing(value: FirestoreAny): boolean {
  return supportedFieldTypes.has(getFieldType(value));
}

/** Editor entry point for a selected field */
const InlineEditor: React.FC<{
  value: FirestoreMap;
  path: string[];
  onCancel: () => void;
  onSave: (key: string, value: FirestoreMap) => void;
}> = ({ value, path, onCancel, onSave }) => {
  const [internalValue, setInternalValue] = useState(value);

  function handleChange(value: FirestoreMap) {
    setInternalValue(value);
  }

  function handleCancel(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onCancel();
  }

  function handleSave(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    // TODO key could change in the editor
    onSave(lastFieldName(path), internalValue);
  }

  return (
    <Elevation z={8} wrap>
      <Card className="Firestore-Field-inline-editor">
        <div>
          <DocumentEditor value={value} onChange={handleChange} />
        </div>
        <CardActionButtons>
          <CardActionButton onClick={handleCancel}>Cancel</CardActionButton>
          <CardActionButton onClick={handleSave}>Save</CardActionButton>
        </CardActionButtons>
      </Card>
    </Elevation>
  );
};

export default InlineEditor;
