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
import { Card, CardActionButtons, CardActionButton } from '@rmwc/card';
import { Elevation } from '@rmwc/elevation';
import { IconButton } from '@rmwc/icon-button';
import { ListItem, ListItemMeta } from '@rmwc/list';

import * as actions from './actions';
import { FirestoreAny } from './models';
import {
  useFieldState,
  useDocumentDispatch,
  DocumentProvider,
} from './DocumentStore';
import { Editor } from './Editor';
import {
  isMap,
  isArray,
  isPrimitive,
  getFieldType,
  getLeafPath,
} from './utils';

import './index.scss';

/** Entry point for a Document/Field preview */
export const Field: React.FC<{ value: FirestoreAny }> = ({ value }) => {
  return (
    <DocumentProvider value={value}>
      <RootField />
    </DocumentProvider>
  );
};

/**
 * Special representation of a Document Root, where we don't want to show
 * the implicit top-level map.
 */
const RootField: React.FC = () => {
  const state = useFieldState([]);
  return (
    <>
      {isMap(state) &&
        Object.keys(state).map(name => (
          <NestedField key={name} path={[name]} />
        ))}
    </>
  );
};

/**
 * Field with CTAs for editing as well as rendering applicable child-nodes
 */
const NestedField: React.FC<{
  path: string[];
  edit?: boolean;
}> = ({ path, edit = false }) => {
  const state = useFieldState(path);
  const dispatch = useDocumentDispatch()!;
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingField, setIsAddingField] = useState(false);
  const [isEditing, setIsEditing] = useState(edit);

  const fieldName = getLeafPath(path);

  function handleDeleteField(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    dispatch(actions.deleteField(path));
  }

  function handleEditField(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setIsEditing(true);
  }

  function handleEditCancel() {
    setIsEditing(false);
  }

  function handleEditSave(value: FirestoreAny) {
    dispatch(actions.updateField({ path, value }));
    setIsEditing(false);
  }

  function handleExpandToggle() {
    setIsExpanded(!isExpanded);
  }

  function handleAddField(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setIsAddingField(true);
  }

  function handleAddCancel() {
    setIsAddingField(false);
  }

  function handleAddSave(value: FirestoreAny) {
    dispatch(actions.addField({ path: addPath, value }));
    setIsAddingField(false);
  }

  let addPath: string[] = [];
  let childFields = null;
  if (isMap(state)) {
    addPath = [...path, ''];
    childFields = Object.keys(state).map(childLeaf => {
      const childPath = [...path, childLeaf];
      return <NestedField key={childLeaf} path={childPath} />;
    });
  } else if (isArray(state)) {
    addPath = [...path, `${state.length}`];
    childFields = state.map((value, index) => {
      const childPath = [...path, `${index}`];
      return <NestedField key={index} path={childPath} />;
    });
  }

  return isEditing ? (
    <InlineEditor
      value={state}
      path={path}
      onCancel={handleEditCancel}
      onSave={handleEditSave}
    />
  ) : (
    <>
      <ListItem onClick={handleExpandToggle}>
        <span>
          {fieldName}:{JSON.stringify(state)}
        </span>
        ({getFieldType(state)})
        <ListItemMeta className="Firestore-Field-actions">
          {isPrimitive(state) ? (
            <IconButton
              icon="edit"
              label="Edit field"
              onClick={handleEditField}
            />
          ) : (
            <IconButton icon="add" label="Add field" onClick={handleAddField} />
          )}
          <IconButton
            icon="delete"
            label="Remove field"
            onClick={handleDeleteField}
          />
        </ListItemMeta>
      </ListItem>
      {isExpanded && childFields}
      {isAddingField && addPath && (
        <InlineEditor
          key={getLeafPath(addPath)}
          value={''}
          path={addPath}
          onCancel={handleAddCancel}
          onSave={handleAddSave}
        />
      )}
    </>
  );
};

/** Editor entry point for a selected field */
const InlineEditor: React.FC<{
  value: FirestoreAny;
  path: string[];
  onCancel: () => void;
  onSave: (value: FirestoreAny) => void;
}> = ({ value, path, onCancel, onSave }) => {
  const [internalValue, setInternalValue] = useState(value);

  function handleChange(value: FirestoreAny) {
    setInternalValue(value);
  }

  function handleCancel(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onCancel();
  }

  function handleSave(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onSave(internalValue);
  }

  return (
    <Elevation z={8} wrap>
      <Card className="Firestore-Field-inline-editor">
        <div>
          <Editor
            value={value}
            onChange={handleChange}
            rootKey={getLeafPath(path)}
          />
        </div>
        <CardActionButtons>
          <CardActionButton onClick={handleCancel}>Cancel</CardActionButton>
          <CardActionButton onClick={handleSave}>Save</CardActionButton>
        </CardActionButtons>
      </Card>
    </Elevation>
  );
};
