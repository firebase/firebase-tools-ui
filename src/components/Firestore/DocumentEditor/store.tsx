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

import { firestore } from 'firebase';
import produce from 'immer';
import get from 'lodash.get';
import React from 'react';
import { Action, createReducer } from 'typesafe-actions';

import { FieldType, FirestoreAny, FirestoreMap } from '../models';
import { getParentPath, isArray, isMap, lastFieldName } from '../utils';
import * as actions from './actions';

const reducer = createReducer<FirestoreMap, Action>({})
  .handleAction(actions.reset, (state, { payload }) => {
    return payload;
  })
  .handleAction(
    actions.addField,
    produce((draft, { payload }) => {
      const parent = get(draft, getParentPath(payload.path)) || draft;
      if (isMap(parent)) {
        parent[lastFieldName(payload.path)] = payload.value;
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
        parent[lastFieldName(payload.path)] = payload.value;
      } else if (isArray(parent)) {
        parent[Number(lastFieldName(payload.path))] = payload.value;
      } else {
        return payload.value;
      }
    })
  )
  .handleAction(
    actions.updateType,
    produce((draft, { payload }) => {
      const parent = get(draft, getParentPath(payload.path)) || draft;
      const defaultValue = defaultValueForType(payload.type);
      if (isMap(parent)) {
        parent[lastFieldName(payload.path)] = defaultValue;
      } else if (isArray(parent) && !isArray(defaultValue)) {
        parent[Number(lastFieldName(payload.path))] = defaultValue;
      }
    })
  )
  .handleAction(
    actions.updateKey,
    produce((draft, { payload }) => {
      const parent = get(draft, getParentPath(payload.path)) || draft;
      const oldFieldName = lastFieldName(payload.path);
      if (isMap(parent)) {
        parent[payload.key] = parent[oldFieldName];
        delete parent[oldFieldName];
      }
    })
  )
  .handleAction(
    actions.deleteField,
    produce((draft, { payload }) => {
      const parent = get(draft, getParentPath(payload)) || draft;
      if (isMap(parent)) {
        delete parent[lastFieldName(payload)];
      } else if (isArray(parent)) {
        parent.splice(Number(lastFieldName(payload)), 1);
      }
    })
  );

function exhaustiveCheck(param: never): never {
  throw new Error(`Unknown FieldType: ${param}`);
}

function defaultValueForType(type: FieldType): FirestoreAny {
  switch (type) {
    case FieldType.ARRAY:
      return [];
    case FieldType.BLOB:
      // TODO
      return '';
    case FieldType.BOOLEAN:
      return true;
    case FieldType.GEOPOINT:
      return new firestore.GeoPoint(0, 0);
    case FieldType.MAP:
      return {};
    case FieldType.NULL:
      return null;
    case FieldType.NUMBER:
      return 0;
    case FieldType.REFERENCE:
      // TODO
      return '';
    case FieldType.STRING:
      return '';
    case FieldType.TIMESTAMP:
      return firestore.Timestamp.fromDate(new Date());
  }
  exhaustiveCheck(type);
}

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
  return get(documentState, path);
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
