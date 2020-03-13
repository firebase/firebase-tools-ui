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

import React, { useEffect, useState, Provider } from 'react';
import _ from 'lodash';
import produce from 'immer';
import { firestore } from 'firebase';
import { Card, CardActionButtons, CardActionButton } from '@rmwc/card';
import { Elevation } from '@rmwc/elevation';
import { IconButton } from '@rmwc/icon-button';
import { ListItem, ListItemMeta } from '@rmwc/list';

import { getLeafPath, getParentPath, getFieldType } from './utils';

import { FieldType } from './models';
import { Editor } from './Editor';
import {
  useDocumentState,
  useFieldState,
  useDocumentDispatch,
  DocumentProvider,
} from './DocumentStore';

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
}> = ({ path }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editState, setEditState] = useState<any>(null);
  const state = useFieldState(path);
  const dispatch = useDocumentDispatch()!;

  const fieldName = getLeafPath(path);
  const fieldType = getFieldType(state);

  function handleDeleteField(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    dispatch({ type: 'delete', path });
  }

  function handleEditField(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setEditState(state);
  }

  function handleEditCancel(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setEditState(null);
  }

  function handleEditSave(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    dispatch({ type: 'update', path, value: editState });
    setEditState(null);
  }

  function handleEditChange(data: any) {
    setEditState(data);
  }

  function handleExpandToggle() {
    setIsExpanded(!isExpanded);
  }

  let childFields = null;
  if (fieldType === FieldType.MAP) {
    childFields = Object.keys(state).map(childLeaf => {
      const childPath = [...path, childLeaf];
      return <NestedField key={childLeaf} path={childPath} />;
    });
  } else if (fieldType === FieldType.ARRAY) {
    childFields = state.map((value: any, index: number) => {
      const childPath = [...path, `${index}`];
      return <NestedField key={index} path={childPath} />;
    });
  }

  return !!editState ? (
    <Elevation z={8} wrap>
      <Card className="Firestore-Field-inline-editor">
        <div>
          <Editor data={state} onChange={handleEditChange} />
        </div>
        <CardActionButtons>
          <CardActionButton onClick={handleEditCancel}>Cancel</CardActionButton>
          <CardActionButton onClick={handleEditSave}>Save</CardActionButton>
        </CardActionButtons>
      </Card>
    </Elevation>
  ) : (
    <>
      <ListItem onClick={handleExpandToggle}>
        {fieldName}:{JSON.stringify(state)}
        <ListItemMeta className="Firestore-Field-actions">
          <IconButton
            icon="edit"
            label="Edit field"
            onClick={handleEditField}
          />
          <IconButton
            icon="delete"
            label="Remove field"
            onClick={handleDeleteField}
          />
        </ListItemMeta>
      </ListItem>
      {isExpanded && childFields}
    </>
  );
};
