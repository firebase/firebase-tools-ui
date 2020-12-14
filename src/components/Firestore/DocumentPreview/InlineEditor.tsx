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

import './InlineEditor.scss';

import {
  Card,
  CardActionButton,
  CardActionButtons,
  CardActions,
} from '@rmwc/card';
import { Elevation } from '@rmwc/elevation';
import firebase from 'firebase';
import React, { useState } from 'react';
import { FocusOn } from 'react-focus-on';

import DocumentEditor from '../DocumentEditor';
import { FirestoreAny } from '../models';

/** Editor entry point for a selected field */
const InlineEditor: React.FC<{
  value: FirestoreAny;
  onCancel: () => void;
  onSave: (key: string, value: FirestoreAny) => void;
  areRootKeysMutable: boolean;
  rtdb?: boolean;
  startingIndex?: number;
  firestore?: firebase.firestore.Firestore;
}> = ({
  value,
  onCancel,
  onSave,
  areRootKeysMutable,
  rtdb,
  startingIndex,
  firestore,
}) => {
  const [internalValue, setInternalValue] = useState<
    FirestoreAny | undefined
  >();

  function handleChange(value: FirestoreAny | undefined) {
    setInternalValue(value);
  }

  function handleCancel() {
    onCancel();
  }

  function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (internalValue) {
      onSave(Object.keys(internalValue)[0], Object.values(internalValue)[0]);
    }
  }

  return (
    <FocusOn
      className="Firestore-InlineEditor-relative-anchor"
      onClickOutside={handleCancel}
      onEscapeKey={handleCancel}
    >
      <Elevation z={8} wrap>
        <Card
          className="Firestore-InlineEditor"
          tag="form"
          onSubmit={handleSubmit}
        >
          <div className="Firestore-InlineEditorContent">
            <DocumentEditor
              value={value}
              onChange={handleChange}
              areRootNamesMutable={areRootKeysMutable}
              areRootFieldsMutable={false}
              rtdb={rtdb}
              startingIndex={startingIndex}
              supportNestedArrays={false}
              firestore={firestore}
            />
          </div>
          <CardActions className="Firestore-InlineEditorActions">
            <CardActionButtons>
              <CardActionButton type="button" onClick={handleCancel}>
                Cancel
              </CardActionButton>
              <CardActionButton
                type="submit"
                unelevated
                disabled={!internalValue}
              >
                Save
              </CardActionButton>
            </CardActionButtons>
          </CardActions>
        </Card>
      </Elevation>
    </FocusOn>
  );
};

export default InlineEditor;
