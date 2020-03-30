import { firestore } from 'firebase';

import DatabaseApi from '../api';
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

let id = 0;
export function getUniqueId() {
  return id++;
}

function normalizeMap(data: FirestoreMap): Store {
  const id = getUniqueId();

  // reducer over object.entries -> childFields
  const children = Object.entries(data).reduce(
    (
      { mapChildren, fields }: { mapChildren: MapChildren; fields: Fields },
      [name, value]: [string, FirestoreAny]
    ) => {
      const child = normalize(value);
      assertStoreHasRoot(child);
      mapChildren.push({
        id: getUniqueId(),
        name,
        valueId: child.id,
      });
      return { mapChildren, fields: { ...fields, ...child.fields } };
    },
    { mapChildren: [], fields: {} }
  );
  return {
    id,
    fields: {
      ...children.fields,
      // add item for current node
      [id]: { mapChildren: children.mapChildren },
    },
  };
}

function normalizeArray(data: FirestoreArray): Store {
  const id = getUniqueId();

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
        id: getUniqueId(),
        valueId: child.id,
      });
      return { arrayChildren, fields: { ...fields, ...child.fields } };
    },
    { arrayChildren: [], fields: {} }
  );
  return {
    id,
    fields: {
      ...children.fields,
      // add item for current node
      [id]: { arrayChildren: children.arrayChildren },
    },
  };
}

function normalizePrimitive(data: FirestorePrimitive): Store {
  const id = getUniqueId();

  if (data instanceof firestore.DocumentReference) {
    return {
      id,
      fields: { [id]: { value: new DocumentPath(data.path) } },
    };
  }
  return { id, fields: { [id]: { value: data } } };
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
  api: DatabaseApi | null
): FirestoreAny {
  assertStoreHasRoot(store);
  const field = store.fields[store.id];
  if (isMapField(field)) {
    return field.mapChildren.reduce((acc, curr) => {
      acc[curr.name] = denormalize(
        {
          id: curr.valueId,
          fields: store.fields,
        },
        api
      );
      return acc;
    }, {} as any);
  } else if (isArrayField(field)) {
    return field.arrayChildren.reduce((acc, curr) => {
      acc.push(denormalize({ id: curr.valueId, fields: store.fields }, api));
      return acc;
    }, [] as any);
  } else {
    if (field.value instanceof DocumentPath) {
      if (!api) {
        throw 'Tried to denormalize a DocumentRef without the FirestoreAPI';
      }
      try {
        return api.database.doc(field.value.path);
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
      return new firestore.GeoPoint(0, 0);
    case FieldType.NULL:
      return null;
    case FieldType.NUMBER:
      return 0;
    case FieldType.REFERENCE:
      return new DocumentPath('');
    case FieldType.STRING:
      return '';
    case FieldType.TIMESTAMP:
      return firestore.Timestamp.fromDate(new Date());
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
