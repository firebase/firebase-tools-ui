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

import React, { useEffect, useCallback, useState } from 'react';
import { firestore } from 'firebase';
import { Card, CardActionButtons, CardActionButton } from '@rmwc/card';
import { Elevation } from '@rmwc/elevation';
import { IconButton } from '@rmwc/icon-button';
import { ListItem, ListItemMeta } from '@rmwc/list';

import * as actions from './actions';
import { FirestoreMap } from './models';
import {
  useFieldState,
  useDocumentState,
  useDocumentDispatch,
  DocumentRefProvider,
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
export const Field: React.FC<{
  value: FirestoreMap;
  documentRef: firestore.DocumentReference;
}> = ({ value, documentRef }) => {
  return (
    <DocumentRefProvider value={value} documentRef={documentRef}>
      <RootField />
    </DocumentRefProvider>
  );
};

/**
 * Special representation of a Document Root, where we don't want to show
 * the implicit top-level map.
 */
const RootField: React.FC = () => {
  const state = useDocumentState();
  return (
    <>
      {Object.keys(state).map(name => (
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
  const doc = useDocumentState();
  const state = useFieldState(path);
  const dispatch = useDocumentDispatch()!;
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingField, setIsAddingField] = useState(false);
  const [isEditing, setIsEditing] = useState(edit);

  const fieldName = getLeafPath(path);

  useEffect(() => {
    // console.log(path);
  }, []);

  // function handleDeleteField(e: React.MouseEvent<HTMLButtonElement>) {
  //   e.stopPropagation();
  //   console.log(path, doc);
  //   dispatch(actions.deleteField(path));
  // }

  const handleDeleteField = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      console.log('delete path', path);
      e.stopPropagation();
      dispatch(actions.deleteField(path));
    },
    [dispatch, path]
  );

  function handleEditField(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setIsEditing(true);
  }

  function handleEditCancel() {
    setIsEditing(false);
  }

  function handleEditSave(value: FirestoreMap) {
    const foo = getLeafPath(path);
    dispatch(actions.updateField({ path, value: value[foo] }));
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

  function handleAddSave(value: FirestoreMap) {
    const foo = getLeafPath(addPath);
    dispatch(actions.addField({ path: addPath, value: value[foo] }));
    setIsAddingField(false);
  }

  let addPath: string[] = [];
  let childFields = null;
  if (isMap(state)) {
    addPath = [...path, 'foo'];
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
      value={{ [getLeafPath(path)]: state }}
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
          value={{ [getLeafPath(addPath)]: '' }}
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
  value: FirestoreMap;
  path: string[];
  onCancel: () => void;
  onSave: (value: FirestoreMap) => void;
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
    onSave(internalValue);
  }

  return (
    <Elevation z={8} wrap>
      <Card className="Firestore-Field-inline-editor">
        <div>
          <Editor value={value} onChange={handleChange} />
        </div>
        <CardActionButtons>
          <CardActionButton onClick={handleCancel}>Cancel</CardActionButton>
          <CardActionButton onClick={handleSave}>Save</CardActionButton>
        </CardActionButtons>
      </Card>
    </Elevation>
  );
};
