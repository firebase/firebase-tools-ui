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

const DocumentStateContext = React.createContext({});
const DocumentDispatchContext = React.createContext<React.Dispatch<any> | null>(
  null
);

const documentReducer = produce((draft: any, action: any) => {
  switch (action.type) {
    case 'reset':
      return action.data;
      break;
    case 'update':
      const parent = _.get(draft, getParentPath(action.path)) || draft;
      const fieldType = getFieldType(parent);
      if (fieldType === FieldType.MAP || fieldType === FieldType.ARRAY) {
        parent[getLeafPath(action.path)] = action.value;
      } else {
        return action.value;
      }
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

export function useDocumentState() {
  const context = React.useContext(DocumentStateContext);
  if (context === undefined) {
    throw new Error('useCountState must be used within a CountProvider');
  }
  return context;
}

export function useDocumentDispatch() {
  const context = React.useContext(DocumentDispatchContext);
  if (context === undefined) {
    throw new Error('useCountState must be used within a CountProvider');
  }
  return context;
}

export function useFieldState(path: string[]) {
  const documentState = useDocumentState();
  if (path.length === 0) return documentState;
  return _.get(documentState, path);
}

export const DocumentProvider: React.FC<{ data: any }> = ({
  data,
  children,
}) => {
  const [state, dispatch] = React.useReducer(documentReducer, {});

  useEffect(() => dispatch({ type: 'reset', data }), [data, dispatch]);

  return (
    <DocumentStateContext.Provider value={state}>
      <DocumentDispatchContext.Provider value={dispatch}>
        {children}
      </DocumentDispatchContext.Provider>
    </DocumentStateContext.Provider>
  );
};
