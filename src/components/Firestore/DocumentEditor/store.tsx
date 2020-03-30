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

import produce from 'immer';
import * as React from 'react';
import { Action, createReducer } from 'typesafe-actions';

import { FieldType, FirestoreAny } from '../models';
import { isArray, isMap, isPrimitive } from '../utils';
import * as actions from './actions';
import {
  Field,
  Store,
  assertIsArrayField,
  assertIsMapField,
  assertIsPrimitiveField,
  assertStoreHasRoot,
} from './types';
import {
  defaultValueForPrimitiveType,
  denormalize,
  getDescendantIds,
  getUniqueId,
  normalize,
} from './utils';

const INIT_STATE = { fields: {} };

const documentStoreContext = React.createContext<{
  store: Store;
  dispatch: React.Dispatch<any>;
}>({ store: INIT_STATE, dispatch: () => {} });

export const reducer = createReducer<Store, Action>({ fields: {} })
  .handleAction(
    actions.addToMap,
    produce((draft, { payload }) => {
      const field = draft.fields[payload.id];
      assertIsMapField(field);
      const normalized = normalize(payload.value);
      assertStoreHasRoot(normalized);
      draft.fields = {
        ...draft.fields,
        ...normalized.fields,
      };
      field.mapChildren.push({
        id: getUniqueId(),
        name: payload.name,
        valueId: normalized.id,
      });
    })
  )
  .handleAction(
    actions.addToArray,
    produce((draft, { payload }) => {
      const field = draft.fields[payload.id];
      assertIsArrayField(field);
      const normalized = normalize(payload.value);
      assertStoreHasRoot(normalized);
      draft.fields = {
        ...draft.fields,
        ...normalized.fields,
      };
      draft.fields[payload.id].arrayChildren.push({
        id: getUniqueId(),
        valueId: normalized.id,
      });
    })
  )
  .handleAction(
    actions.removeFromMap,
    produce((draft, { payload }) => {
      const field = draft.fields[payload.id];
      assertIsMapField(field);
      const child = field.mapChildren.find(c => c.id === payload.childId);
      if (!child) {
        throw 'No map-child found with given ID';
      }

      // Remove any descendants
      for (const id of getDescendantIds(draft.fields, [child.valueId])) {
        delete draft.fields[id];
      }

      // Remove reference from parent
      field.mapChildren = field.mapChildren.filter(
        c => c.id !== payload.childId
      );
    })
  )
  .handleAction(
    actions.removeFromArray,
    produce((draft, { payload }) => {
      const field = draft.fields[payload.id];
      assertIsArrayField(field);
      const child = field.arrayChildren.find(c => c.id === payload.childId);
      if (!child) {
        throw 'No array-child found with given ID';
      }

      // Remove any descendants
      for (const id of getDescendantIds(draft.fields, [child.valueId])) {
        delete draft.fields[id];
      }

      // Remove reference from parent
      field.arrayChildren = field.arrayChildren.filter(
        c => c.id !== payload.childId
      );
    })
  )
  .handleAction(
    actions.updateName,
    produce((draft, { payload }) => {
      const field = draft.fields[payload.id];
      assertIsMapField(field);
      const childField = field.mapChildren.find(c => c.id === payload.childId);
      if (!childField) {
        throw 'No map-child found with given ID';
      }
      childField.name = payload.name;
    })
  )
  .handleAction(
    actions.updateType,
    produce((draft, { payload }) => {
      const field = draft.fields[payload.id];
      if (payload.type === FieldType.MAP) {
        draft.fields[payload.id] = { mapChildren: [] };
      } else if (payload.type === FieldType.ARRAY) {
        draft.fields[payload.id] = { arrayChildren: [] };
      } else {
        draft.fields[payload.id] = {
          value: defaultValueForPrimitiveType(payload.type),
        };
      }
    })
  )
  .handleAction(
    actions.updateValue,
    produce((draft, { payload }) => {
      const field = draft.fields[payload.id];
      assertIsPrimitiveField(field);
      field.value = payload.value;
    })
  );

export const storeReducer: React.Reducer<Store, Action> = (state, action) => {
  return (reducer.handlers as any)[action.type](state, action);
};

export const DocumentStore: React.FC<{
  store: Store;
  dispatch: React.Dispatch<Action>;
}> = ({ store, dispatch, children }) => {
  return (
    <documentStoreContext.Provider value={{ store, dispatch }}>
      {children}
    </documentStoreContext.Provider>
  );
};

export function useDocumentStore(): {
  store: Store;
  dispatch: React.Dispatch<Action>;
} {
  const context = React.useContext(documentStoreContext);
  if (context === undefined) {
    throw new Error('useDocumentStore must be used within a <DocumentStore>');
  }
  return context;
}

export function useStore(): Store {
  const { store } = useDocumentStore();
  return React.useMemo(() => store, [store]);
}

export function useDispatch(): React.Dispatch<Action> {
  const { dispatch } = useDocumentStore();
  return React.useMemo(() => dispatch, [dispatch]);
}

export function useField(id: number): Field {
  const store = useStore();
  return React.useMemo(() => store.fields[id], [store, id]);
}
