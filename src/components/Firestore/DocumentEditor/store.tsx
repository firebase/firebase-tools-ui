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
import React, { useMemo } from 'react';
import { Action, createReducer } from 'typesafe-actions';

import {
  FieldType,
  FirestoreAny,
  FirestoreArray,
  FirestoreMap,
} from '../models';
import {
  isArray,
  isBoolean,
  isGeoPoint,
  isNumber,
  isPrimitive,
  isReference,
  isString,
  isTimestamp,
} from '../utils';
import * as actions from './actions';

function makeIdGenerator() {
  let counter = 1;
  return () => counter++;
}

/** Utility for generating unique ids for normalized state objects. */
export const getUniqueId: () => number = makeIdGenerator();

interface FieldBase<T extends FieldType> {
  name: string;
  type: T;
}

interface PrimitiveField<T extends FieldType, V> extends FieldBase<T> {
  name: string;
  value: V;
}

type StringField = PrimitiveField<FieldType.STRING, string>;
type NumberField = PrimitiveField<FieldType.NUMBER, number>;
type BooleanField = PrimitiveField<FieldType.BOOLEAN, boolean>;
type NullField = PrimitiveField<FieldType.NULL, null>;
type GeoPointField = PrimitiveField<FieldType.GEOPOINT, firestore.GeoPoint>;
type TimestampField = PrimitiveField<FieldType.TIMESTAMP, firestore.Timestamp>;
type ReferenceField = PrimitiveField<
  FieldType.REFERENCE,
  firestore.DocumentReference
>;

type PrimitiveFields =
  | StringField
  | NumberField
  | BooleanField
  | NullField
  | GeoPointField
  | TimestampField
  | ReferenceField;

interface ContainerField<T extends FieldType> extends FieldBase<T> {
  childrenIds: number[];
}

type MapField = ContainerField<FieldType.MAP>;
type ArrayField = ContainerField<FieldType.ARRAY>;

type ContainerFields = MapField | ArrayField;

type ArrayChildField = MapField | PrimitiveFields;

export type NewField = PrimitiveFields | ContainerFields;
type Field = NewField & { readonly id: number };

export function isMapChildField(
  field: Field
): field is Extract<Field, NewField> {
  return 'name' in field;
}

export function isArrayChildField(
  field: Field
): field is Extract<Field, ArrayChildField> {
  return !('name' in field);
}

export function isContainerField(
  field: Field
): field is Extract<Field, MapField | ArrayField> {
  return 'childrenIds' in field;
}

interface State {
  fields: { [id: number]: Field };
  rootFieldIds: number[];
}

function getDescendantIds(
  fieldStateMap: {
    [id: number]: Field;
  },
  ids: number[]
): number[] {
  return ids.reduce((acc, id) => {
    acc.push(id);
    const field = fieldStateMap[id];
    if (field.type === FieldType.MAP || field.type === FieldType.ARRAY) {
      acc.push(...getDescendantIds(fieldStateMap, field.childrenIds));
    }
    return acc;
  }, [] as number[]);
}

const reducer = createReducer<State, Action>({ fields: {}, rootFieldIds: [] })
  .handleAction(
    actions.addMapChildField,
    produce((draft, { payload }) => {
      if (
        payload.parentId &&
        draft.fields[payload.parentId]?.type !== FieldType.MAP
      ) {
        throw new Error('Tried to add a map-child to a non-map');
      }

      const id = getUniqueId();
      draft.fields[id] = { ...payload.state, id };
      if (payload.parentId) {
        draft.fields[payload.parentId].childrenIds.push(id);
      } else {
        draft.rootFieldIds.push(id);
      }
    })
  )
  .handleAction(
    actions.addArrayChildField,
    produce((draft, { payload }) => {
      if (draft.fields[payload.parentId]?.type !== FieldType.ARRAY) {
        throw new Error('Tried to add an array-child to a non-array');
      }

      const id = getUniqueId();
      draft.fields[id] = { ...payload.state, id };
      if (payload.parentId) {
        draft.fields[payload.parentId].childrenIds.push(id);
      }
    })
  )
  .handleAction(
    actions.addField,
    produce((draft, { payload }) => {
      const id = getUniqueId();
      draft.fields[id] = { ...payload.state, id };
      if (payload.parentId) {
        draft.fields[payload.parentId].childrenIds.push(id);
      } else {
        draft.rootFieldIds.push(id);
      }
    })
  )
  .handleAction(
    actions.updateName,
    produce((draft, { payload }) => {
      draft.fields[payload.id].name = payload.name;
    })
  )
  .handleAction(
    actions.updateType,
    produce((draft, { payload }) => {
      draft.fields[payload.id].type = payload.type;
      if (payload.type === FieldType.MAP || payload.type === FieldType.ARRAY) {
        delete draft.fields[payload.id]['value'];
        draft.fields[payload.id].childrenIds = [];
      } else {
        delete draft.fields[payload.id]['childrenIds'];
        draft.fields[payload.id].value = defaultValueForType(payload.type);
      }
    })
  )
  .handleAction(
    actions.updateValue,
    produce((draft, { payload }) => {
      draft.fields[payload.id].value = payload.value;
    })
  )
  .handleAction(
    actions.deleteField,
    produce((draft, { payload }) => {
      // Remove the referenced-field and any getDescendantIds
      for (const id of getDescendantIds(draft.fields, [payload.id])) {
        delete draft.fields[id];
      }
      // Remove reference from parent
      for (const field of Object.values(draft.fields) as Field[]) {
        if (
          (field.type === FieldType.MAP || field.type === FieldType.ARRAY) &&
          field.childrenIds.includes(payload.id)
        ) {
          field.childrenIds.splice(
            field.childrenIds.findIndex(id => id === payload.id),
            1
          );
        }
      }
      // Remove reference from root
      if (draft.rootFieldIds.includes(payload.id)) {
        draft.rootFieldIds.splice(
          draft.rootFieldIds.findIndex((id: number) => id === payload.id),
          1
        );
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

export const DocumentStateContext = React.createContext<State>({
  fields: {},
  rootFieldIds: [] as number[],
});
const DocumentDispatchContext = React.createContext<React.Dispatch<
  Action
> | null>(null);

export function useDocumentDispatch() {
  const context = React.useContext(DocumentDispatchContext);
  if (context === undefined) {
    throw new Error(
      'useDocumentDispatch must be used within a DocumentProvider'
    );
  }
  return context;
}

function useDocumentState(): State {
  const context = React.useContext(DocumentStateContext);
  if (context === undefined) {
    throw new Error('useDocumentState must be used within a DocumentProvider');
  }

  return context;
}

export function useRootFields(): Field[] {
  const state = useDocumentState();
  return useMemo(
    () => state.rootFieldIds.map(fieldId => state.fields[fieldId]),
    [state]
  );
}

export function useSdkMap(): FirestoreMap {
  const state = useDocumentState();
  const rootFields = useRootFields();

  const sdkMap = useMemo(
    () =>
      rootFields.reduce((acc, field) => {
        // Root-fields are always map-children
        if (isMapChildField(field)) {
          acc[field.name] = denormalizeField(field, state);
        }
        return acc;
      }, {} as { [name: string]: FirestoreAny }),
    [state, rootFields]
  );

  return sdkMap;
}

export function useFieldState(id: number): Field {
  const state = useDocumentState();
  return useMemo(() => state.fields[id], [state, id]);
}

export function useSiblingFields(id: number): Field[] {
  const state = useDocumentState();

  return useMemo(() => {
    let siblingIds: number[] = [];

    if (state.rootFieldIds.includes(id)) {
      siblingIds = state.rootFieldIds.filter(fieldId => fieldId !== id);
    }

    for (const field of Object.values(state.fields)) {
      if (isContainerField(field) && field.childrenIds.includes(id)) {
        siblingIds = field.childrenIds.filter(fieldId => fieldId !== id);
        break;
      }
    }

    return siblingIds.map(fieldId => state.fields[fieldId]);
  }, [state, id]);
}

export const DocumentProvider: React.FC<{ value: FirestoreMap }> = ({
  value = {},
  children,
}) => {
  const [state, dispatch] = React.useReducer(reducer, sdkToState(value));

  return (
    <DocumentStateContext.Provider value={state}>
      <DocumentDispatchContext.Provider value={dispatch}>
        {children}
      </DocumentDispatchContext.Provider>
    </DocumentStateContext.Provider>
  );
};

function denormalizeField(field: Field, state: State): FirestoreAny {
  if (field.type === FieldType.ARRAY) {
    return field.childrenIds.reduce((acc, id) => {
      const childField = state.fields[id];
      if (isArrayChildField(childField)) {
        const foo = denormalizeField(childField, state);
        if (!isArray(foo)) {
          acc.push(foo);
        }
      }
      return acc;
    }, [] as FirestoreArray);
  }
  if (isMapChildField(field)) {
    if (field.type === FieldType.MAP) {
      return field.childrenIds.reduce((acc, id) => {
        const childField = state.fields[id];
        if (isMapChildField(childField)) {
          acc[childField.name] = denormalizeField(childField, state);
        }
        return acc;
      }, {} as FirestoreMap);
    }
  }
  return field.value;
}

function sdkToState(sdk: FirestoreMap): State {
  const fields: { [id: number]: Field } = {};
  const rootFieldIds = [];
  for (const [key, value] of Object.entries(sdk)) {
    // TODO: add support for ingesting maps/arrays into the editor, not required
    // as of 3/27/20
    if (isPrimitive(value)) {
      let newField: NewField | undefined = undefined;

      if (isString(value)) {
        newField = {
          name: key,
          type: FieldType.STRING,
          value: value,
        };
      }

      if (isNumber(value)) {
        newField = {
          name: key,
          type: FieldType.NUMBER,
          value: value,
        };
      }

      if (isBoolean(value)) {
        newField = {
          name: key,
          type: FieldType.BOOLEAN,
          value: value,
        };
      }

      if (isGeoPoint(value)) {
        newField = {
          name: key,
          type: FieldType.GEOPOINT,
          value: value,
        };
      }

      if (isReference(value)) {
        newField = {
          name: key,
          type: FieldType.REFERENCE,
          value: value,
        };
      }

      if (isTimestamp(value)) {
        newField = {
          name: key,
          type: FieldType.TIMESTAMP,
          value: value,
        };
      }

      if (value === null) {
        newField = {
          name: key,
          type: FieldType.NULL,
          value: value,
        };
      }

      if (newField) {
        const field: Field = { ...newField, id: getUniqueId() };
        fields[field.id] = field;
        rootFieldIds.push(field.id);
      }
    }
  }
  return {
    fields,
    rootFieldIds,
  };
}
