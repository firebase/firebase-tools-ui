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

import firebase from 'firebase';

import {
  FieldType,
  FirestoreAny,
  FirestoreArray,
  FirestoreMap,
  FirestorePrimitive,
} from '../models';
import {
  ArrayChildren,
  DocumentPath,
  Fields,
  MapChildren,
  PrimitiveValue,
  Store,
  assertStoreHasRoot,
  isArrayField,
  isFirestoreArray,
  isFirestoreMap,
  isMapField,
} from './types';

let uuid = 0;
export function getUniqueId() {
  return uuid++;
}

function normalizeMap(data: FirestoreMap): Store {
  const uuid = getUniqueId();

  // reducer over object.entries -> childFields
  const children = Object.entries(data).reduce(
    (
      { mapChildren, fields }: { mapChildren: MapChildren; fields: Fields },
      [name, value]: [string, FirestoreAny]
    ) => {
      const child = normalize(value);
      assertStoreHasRoot(child);
      mapChildren.push({
        uuid: getUniqueId(),
        name,
        valueId: child.uuid,
      });
      return { mapChildren, fields: { ...fields, ...child.fields } };
    },
    { mapChildren: [], fields: {} }
  );
  return {
    uuid,
    fields: {
      ...children.fields,
      // add item for current node
      [uuid]: { mapChildren: children.mapChildren },
    },
  };
}

function normalizeArray(data: FirestoreArray): Store {
  const uuid = getUniqueId();

  // reducer over array elements -> childFields
  const children = data.reduce(
    (
      {
        arrayChildren,
        fields,
      }: { arrayChildren: ArrayChildren; fields: Fields },
      value: FirestoreMap | FirestorePrimitive
    ) => {
      const child = normalize(value);
      assertStoreHasRoot(child);
      arrayChildren.push({
        uuid: getUniqueId(),
        valueId: child.uuid,
      });
      return { arrayChildren, fields: { ...fields, ...child.fields } };
    },
    { arrayChildren: [], fields: {} }
  );
  return {
    uuid,
    fields: {
      ...children.fields,
      // add item for current node
      [uuid]: { arrayChildren: children.arrayChildren },
    },
  };
}

function normalizePrimitive(data: FirestorePrimitive): Store {
  const uuid = getUniqueId();

  if (data instanceof firebase.firestore.DocumentReference) {
    return {
      uuid,
      fields: { [uuid]: { value: new DocumentPath(data.path) } },
    };
  }
  return { uuid, fields: { [uuid]: { value: data } } };
}

export function normalize(data: FirestoreAny): Store {
  if (isFirestoreMap(data)) {
    return normalizeMap(data);
  } else if (isFirestoreArray(data)) {
    return normalizeArray(data);
  } else {
    return normalizePrimitive(data);
  }
}

export function denormalize(
  store: Store,
  firestore?: firebase.firestore.Firestore
): FirestoreAny {
  assertStoreHasRoot(store);
  const field = store.fields[store.uuid];
  if (isMapField(field)) {
    return field.mapChildren.reduce((acc, curr) => {
      acc[curr.name] = denormalize(
        {
          uuid: curr.valueId,
          fields: store.fields,
        },
        firestore
      );
      return acc;
    }, {} as any);
  } else if (isArrayField(field)) {
    return field.arrayChildren.reduce((acc, curr) => {
      acc.push(
        denormalize({ uuid: curr.valueId, fields: store.fields }, firestore)
      );
      return acc;
    }, [] as any);
  } else {
    if (field.value instanceof DocumentPath) {
      if (!firestore) {
        // TODO: Trying to reference a Firestore Document without a Firestore instance.
        return '';
      }
      try {
        return firestore.doc(field.value.path);
      } catch {
        // TODO: The store does not always have a valid DocRef, reconsider.
        return '';
      }
    }
    return field.value;
  }
}

export function defaultValueForPrimitiveType(type: FieldType): PrimitiveValue {
  switch (type) {
    case FieldType.BLOB:
      // TODO
      return '';
    case FieldType.BOOLEAN:
      return true;
    case FieldType.GEOPOINT:
      return new firebase.firestore.GeoPoint(0, 0);
    case FieldType.NULL:
      return null;
    case FieldType.NUMBER:
      return 0;
    case FieldType.REFERENCE:
      return new DocumentPath('');
    case FieldType.STRING:
      return '';
    case FieldType.TIMESTAMP:
      return firebase.firestore.Timestamp.fromDate(new Date());
  }
  return '';
}

export function getDescendantIds(fields: Fields, ids: number[]): number[] {
  return ids.reduce((acc, id) => {
    acc.push(id);
    const field = fields[id];
    if (isMapField(field)) {
      acc.push(
        ...getDescendantIds(
          fields,
          field.mapChildren.map(c => c.valueId)
        )
      );
    } else if (isArrayField(field)) {
      acc.push(
        ...getDescendantIds(
          fields,
          field.arrayChildren.map(c => c.valueId)
        )
      );
    }
    return acc;
  }, [] as number[]);
}
