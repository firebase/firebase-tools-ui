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
import last from 'lodash.last';
import produce from 'immer';
import { Action, createReducer } from 'typesafe-actions';

import * as actions from './actions';
import { isMap, isArray, getParentPath } from '../utils';
import { FirestoreAny, FirestoreMap } from '../models';

const reducer = createReducer<FirestoreMap, Action>({})
  .handleAction(actions.reset, (state, { payload }) => {
    return payload;
  })
  .handleAction(
    actions.addField,
    produce((draft, { payload }) => {
      const parent = get(draft, getParentPath(payload.path)) || draft;
      if (isMap(parent)) {
        parent[last(payload.path) as string] = payload.value;
      } else if (isArray(parent)) {
        parent.push(payload.value);
      }
    })
  )
  .handleAction(
    actions.updateField,
    produce((draft, { payload }) => {
      const parent = get(draft, getParentPath(payload.path)) || draft;
      if (isMap(parent)) {
        parent[last(payload.path) as string] = payload.value;
      } else if (isArray(parent)) {
        parent[Number(last(payload.path))] = payload.value;
      } else {
        return payload.value;
      }
    })
  )
  .handleAction(
    actions.deleteField,
    produce((draft, { payload }) => {
      const parent = get(draft, getParentPath(payload)) || draft;
      if (isMap(parent)) {
        delete parent[last(payload) as string];
      } else if (isArray(parent)) {
        parent.splice(Number(last(payload)), 1);
      }
    })
  );

export const DocumentStateContext = React.createContext<FirestoreMap>({});
const DocumentDispatchContext = React.createContext<React.Dispatch<
  Action
> | null>(null);

export function useDocumentState(): FirestoreMap {
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

export function useFieldState(path: string[]): FirestoreAny {
  const documentState = useDocumentState();
  if (path.length === 0) return documentState;
  return get(documentState, path) || '';
}

export const DocumentProvider: React.FC<{ value: FirestoreMap }> = ({
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
