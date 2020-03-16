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

import React, { useState } from 'react';
import { firestore } from 'firebase';
import { ListItem, ListItemMeta } from '@rmwc/list';
import { IconButton } from '@rmwc/icon-button';

import { updateField, deleteField } from './api';
import InlineEditor from './InlineEditor';
import { useDocumentState, useFieldState } from './store';
import {
  getFieldType,
  isPrimitive,
  getLeafKey,
  isMap,
  isArray,
} from '../utils';

const FieldPreview: React.FC<{
  path: string[];
  documentRef: firestore.DocumentReference;
}> = ({ path, documentRef }) => {
  const documentData = useDocumentState();
  const state = useFieldState(path);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingField, setIsAddingField] = useState(false);

  let addPath: string[] = [];
  let childFields = null;
  if (isMap(state)) {
    // Inline editor for new field will default to key: ''
    addPath = [...path, ''];
    childFields = Object.keys(state).map(childLeaf => {
      const childPath = [...path, childLeaf];
      return (
        <FieldPreview
          key={childLeaf}
          path={childPath}
          documentRef={documentRef}
        />
      );
    });
  } else if (isArray(state)) {
    // Inline editor for new field will default to key: '{index}'
    addPath = [...path, `${state.length}`];
    childFields = state.map((value, index) => {
      const childPath = [...path, `${index}`];
      return (
        <FieldPreview key={index} path={childPath} documentRef={documentRef} />
      );
    });
  }

  return isEditing ? (
    <InlineEditor
      value={{ [getLeafKey(path)]: state }}
      path={path}
      onCancel={() => {
        setIsEditing(false);
      }}
      onSave={(key, value) => {
        updateField(documentRef, documentData, path, value[key]);
        setIsEditing(false);
      }}
    />
  ) : (
    <>
      <ListItem onClick={() => setIsExpanded(!isExpanded)}>
        <span>
          {getLeafKey(path)}:{JSON.stringify(state)}
        </span>
        ({getFieldType(state)})
        <ListItemMeta>
          {isPrimitive(state) ? (
            <IconButton
              icon="edit"
              label="Edit field"
              onClick={e => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            />
          ) : (
            <IconButton
              icon="add"
              label="Add field"
              onClick={e => {
                e.stopPropagation();
                setIsAddingField(true);
              }}
            />
          )}
          <IconButton
            icon="delete"
            label="Remove field"
            onClick={e => {
              e.stopPropagation();
              deleteField(documentRef, documentData, path);
            }}
          />
        </ListItemMeta>
      </ListItem>
      {addPath && isAddingField && (
        <InlineEditor
          value={{ [getLeafKey(addPath)]: '' }}
          path={addPath}
          onCancel={() => {
            setIsAddingField(false);
          }}
          onSave={(key, value) => {
            updateField(documentRef, documentData, addPath, value[key]);
            setIsAddingField(false);
          }}
        />
      )}
      {isExpanded && childFields}
    </>
  );
};

export default FieldPreview;
