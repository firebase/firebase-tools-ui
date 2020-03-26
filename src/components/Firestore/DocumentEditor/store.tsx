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
import React, { useMemo } from 'react';
import { Action, createReducer } from 'typesafe-actions';

import {
  FieldType,
  FirestoreAny,
  FirestoreArray,
  FirestoreMap,
} from '../models';
import {
  getFieldType,
  getParentPath,
  isArray,
  isBoolean,
  isGeoPoint,
  isMap,
  isNumber,
  isPrimitive,
  isReference,
  isString,
  isTimestamp,
  lastFieldName,
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

export type NewField = PrimitiveFields | ContainerFields;
type Field = NewField & { id: number };

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
  //  .handleAction(actions.reset, (state, { payload }) => {
  //    return [];
  //  })
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
  .handleAction(actions.deleteField, (state, { payload }) => {
    return withFieldRemoved(state, payload);
  });

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

export function useSdkMap(): FirestoreMap {
  const context = React.useContext(DocumentStateContext);
  if (context === undefined) {
    throw new Error('useSdkMap must be used within a DocumentProvider');
  }

  const rootFields = useRootFields();

  const sdkMap = useMemo(
    () =>
      rootFields.reduce((acc, field) => {
        acc[field.name] = denormalizeField(field, context)[field.name];
        return acc;
      }, {} as { [name: string]: FirestoreAny }),
    [context]
  );

  return sdkMap;
}

export function useRootFields(): Field[] {
  const context = React.useContext(DocumentStateContext);
  if (context === undefined) {
    throw new Error('useRootFields must be used within a DocumentProvider');
  }
  return context.rootFieldIds.reduce(
    (acc, id) => [...acc, context.fields[id]],
    [] as Field[]
  );
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

export function useFieldState(id: number): Field {
  const context = React.useContext(DocumentStateContext);
  if (context === undefined) {
    throw new Error('useFieldState must be used within a DocumentProvider');
  }
  return context.fields[id];
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

function denormalizeField(field: Field, state: State): FirestoreMap {
  if (field.type === FieldType.MAP) {
    return {
      [field.name]: field.childrenIds.reduce((acc, id) => {
        const childField = state.fields[id];
        acc[childField.name] = denormalizeField(childField, state)[
          childField.name
        ];
        return acc;
      }, {} as FirestoreMap),
    };
  }
  if (field.type === FieldType.ARRAY) {
    return {
      [field.name]: field.childrenIds.reduce((acc, id) => {
        const childField = state.fields[id];
        if (childField.type !== FieldType.ARRAY) {
          acc.push(denormalizeField(childField, state)[childField.name] as any);
        }
        return acc;
      }, [] as FirestoreArray),
    };
  }
  return { [field.name]: field.value };
}

function sdkToState(sdk: FirestoreMap): State {
  const fields: { [id: number]: Field } = {};
  const rootFieldIds = [];
  for (const [key, value] of Object.entries(sdk)) {
    const fieldType = getFieldType(value);

    if (isString(value)) {
      const field: Field = {
        id: getUniqueId(),
        name: key,
        type: FieldType.STRING,
        value: value,
      };
      fields[field.id] = field;
      rootFieldIds.push(field.id);
    }

    if (isNumber(value)) {
      const field: Field = {
        id: getUniqueId(),
        name: key,
        type: FieldType.NUMBER,
        value: value,
      };
      fields[field.id] = field;
      rootFieldIds.push(field.id);
    }

    if (isBoolean(value)) {
      const field: Field = {
        id: getUniqueId(),
        name: key,
        type: FieldType.BOOLEAN,
        value: value,
      };
      fields[field.id] = field;
      rootFieldIds.push(field.id);
    }

    if (isGeoPoint(value)) {
      const field: Field = {
        id: getUniqueId(),
        name: key,
        type: FieldType.GEOPOINT,
        value: value,
      };
      fields[field.id] = field;
      rootFieldIds.push(field.id);
    }

    if (isReference(value)) {
      const field: Field = {
        id: getUniqueId(),
        name: key,
        type: FieldType.REFERENCE,
        value: value,
      };
      fields[field.id] = field;
      rootFieldIds.push(field.id);
    }

    if (isTimestamp(value)) {
      const field: Field = {
        id: getUniqueId(),
        name: key,
        type: FieldType.TIMESTAMP,
        value: value,
      };
      fields[field.id] = field;
      rootFieldIds.push(field.id);
    }

    if (value === null) {
      const field: Field = {
        id: getUniqueId(),
        name: key,
        type: FieldType.NULL,
        value: value,
      };
      fields[field.id] = field;
      rootFieldIds.push(field.id);
    }
  }
  return {
    fields,
    rootFieldIds,
  };
}
