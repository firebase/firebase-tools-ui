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
import { IconButton } from '@rmwc/icon-button';
import { ListItem, ListItemMeta } from '@rmwc/list';

import { getFieldType } from './utils';
import { useDocumentRef } from './DocumentRefContext';

import { FieldType } from './models';

import './index.scss';

const DocumentStateContext = React.createContext({});
const DocumentDispatchContext = React.createContext<React.Dispatch<any> | null>(
  null
);

function getParentPath(path: string[]) {
  return path.splice(0, path.length - 1);
}

function getLeafPath(path: string[]) {
  return path[path.length - 1];
}

const documentReducer = produce((draft: any, action: any) => {
  switch (action.type) {
    case 'reset':
      return action.data;
      break;
    case 'delete': {
      const parent = _.get(draft, getParentPath(action.path)) || draft;
      if (getFieldType(parent) === FieldType.MAP) {
        delete parent[getLeafPath(action.path)];
      } else {
        parent.splice(getLeafPath(action.path), 1);
      }
      break;
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
});

function useDocumentState() {
  const context = React.useContext(DocumentStateContext);
  if (context === undefined) {
    throw new Error('useCountState must be used within a CountProvider');
  }
  return context;
}

function useDocumentDispatch() {
  const context = React.useContext(DocumentDispatchContext);
  if (context === undefined) {
    throw new Error('useCountState must be used within a CountProvider');
  }
  return context;
}

function useFieldState(path: string[]) {
  const documentState = useDocumentState();
  if (path.length === 0) return documentState;
  return _.get(documentState, path);
}

export const Field: React.FC<{ data: any }> = ({ data }) => {
  const [state, dispatch] = React.useReducer(documentReducer, {});

  useEffect(() => dispatch({ type: 'reset', data }), [data, dispatch]);

  return (
    <DocumentStateContext.Provider value={state}>
      <DocumentDispatchContext.Provider value={dispatch}>
        {Object.keys(state).map(name => (
          <NestedField key={name} path={[name]} />
        ))}
      </DocumentDispatchContext.Provider>
    </DocumentStateContext.Provider>
  );
};

const NestedField: React.FC<{
  path: string[];
}> = ({ path }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const state = useFieldState(path);
  const dispatch = useDocumentDispatch()!;

  const fieldName = getLeafPath(path);
  const fieldType = getFieldType(state);

  function handleDeleteField(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    dispatch({ type: 'delete', path });
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

  return (
    <>
      <ListItem onClick={handleExpandToggle}>
        {fieldName}:{JSON.stringify(state)}
        <ListItemMeta className="Firestore-Field-actions">
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
