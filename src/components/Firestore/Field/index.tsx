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
import {
  useFieldState,
  useDocumentDispatch,
  DocumentProvider,
} from './DocumentStore';
import { Editor } from './Editor';
import { isMap, isArray, isPrimitive, getLeafPath } from './utils';

import './index.scss';

export const Field: React.FC<{ data: any }> = ({ data }) => {
  return (
    <DocumentProvider data={data}>
      <RootField />
    </DocumentProvider>
  );
};

const RootField: React.FC = () => {
  const state = useFieldState([]);
  return (
    <>
      {Object.keys(state).map(name => (
        <NestedField key={name} path={[name]} />
      ))}
    </>
  );
};

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

  function handleEditSave(value: any) {
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

  function handleAddSave(value: any) {
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
      data={state}
      path={path}
      onCancel={handleEditCancel}
      onSave={handleEditSave}
    />
  ) : (
    <>
      <ListItem onClick={handleExpandToggle}>
        {fieldName}:{JSON.stringify(state)}
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
          data={''}
          path={addPath}
          onCancel={handleAddCancel}
          onSave={handleAddSave}
        />
      )}
    </>
  );
};

const InlineEditor: React.FC<{
  data: any;
  path: string[];
  onCancel: () => void;
  onSave: (data: any) => void;
}> = ({ data, path, onCancel, onSave }) => {
  const [internalData, setInternalData] = useState(data);

  function handleChange(data: any) {
    setInternalData(data);
  }

  function handleCancel(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onCancel();
  }

  function handleSave(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onSave(internalData);
  }

  return (
    <Elevation z={8} wrap>
      <Card className="Firestore-Field-inline-editor">
        <div>
          <Editor
            data={data}
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
