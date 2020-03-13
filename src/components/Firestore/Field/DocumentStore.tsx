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

import React from 'react';
import get from 'lodash.get';
import produce from 'immer';
import { Action, createReducer } from 'typesafe-actions';

import { isMap, isArray, getLeafPath, getParentPath } from './utils';
import { FirestoreAny } from './models';
import * as actions from './actions';

const reducer = createReducer<FirestoreAny, Action>({})
  .handleAction(actions.reset, (state, { payload }) => {
    return payload;
  })
  .handleAction(
    actions.addField,
    produce((draft: FirestoreAny, { payload }) => {
      const parent = get(draft, getParentPath(payload.path)) || draft;
      if (isMap(parent)) {
        parent[getLeafPath(payload.path)] = payload.value;
      } else if (isArray(parent)) {
        parent.push(payload.value);
      }
    })
  )
  .handleAction(
    actions.updateField,
    produce((draft: FirestoreAny, { payload }) => {
      const parent = get(draft, getParentPath(payload.path)) || draft;
      if (isMap(parent) || isArray(parent)) {
        parent[getLeafPath(payload.path)] = payload.value;
      } else {
        return payload.value;
      }
    })
  )
  .handleAction(
    actions.deleteField,
    produce((draft: FirestoreAny, { payload }) => {
      const parent = get(draft, getParentPath(payload)) || draft;
      if (isMap(parent)) {
        delete parent[getLeafPath(payload)];
      } else if (isArray(parent)) {
        parent.splice(parseInt(getLeafPath(payload)), 1);
      }
    })
  );

export const DocumentStateContext = React.createContext<FirestoreAny>({});
const DocumentDispatchContext = React.createContext<React.Dispatch<
  Action
> | null>(null);

export function useDocumentState() {
  const context = React.useContext(DocumentStateContext);
  if (context === undefined) {
    throw new Error('useDocumentState must be used within a DocumentProvider');
  }
  return context;
}

export function useDocumentDispatch() {
  const context = React.useContext(DocumentDispatchContext);
  if (context === undefined) {
    throw new Error(
      'useDocumentDispatch must be used within a DocumentProvider'
    );
  }
  return context;
}

export function useFieldState(path: string[]) {
  const documentState = useDocumentState();
  if (path.length === 0) return documentState;
  return get(documentState, path) || '';
}

export const DocumentProvider: React.FC<{ value: FirestoreAny }> = ({
  value = {},
  children,
}) => {
  const [state, dispatch] = React.useReducer(reducer, value);

  return (
    <DocumentStateContext.Provider value={state}>
      <DocumentDispatchContext.Provider value={dispatch}>
        {children}
      </DocumentDispatchContext.Provider>
    </DocumentStateContext.Provider>
  );
};
