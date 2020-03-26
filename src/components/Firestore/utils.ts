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
import { useEffect, useState } from 'react';
import { useLocation, useRouteMatch } from 'react-router-dom';

import {
  FieldType,
  FirestoreAny,
  FirestoreArray,
  FirestoreMap,
  FirestorePrimitive,
} from './models';

export function getParentPath(path: string[]) {
  return path.slice(0, path.length - 1);
}

export function lastFieldName(path: string[]): string {
  if (!path.length)
    throw new Error(`${path} is empty and has no _last_ field name`);
  return path[path.length - 1];
}

export function getFieldType(value: FirestoreAny): FieldType {
  if (value === null) {
    return FieldType.NULL;
  }

  if (value instanceof firestore.Timestamp) {
    return FieldType.TIMESTAMP;
  }

  if (value instanceof Array) {
    return FieldType.ARRAY;
  }

  if (value instanceof firestore.DocumentReference) {
    return FieldType.REFERENCE;
  }

  if (value instanceof firestore.GeoPoint) {
    return FieldType.GEOPOINT;
  }

  if (value instanceof firestore.Blob) {
    return FieldType.BLOB;
  }

  if (typeof value === 'object') {
    return FieldType.MAP;
  }

  return typeof value as FieldType;
}

export function isBoolean(value: FirestoreAny): value is boolean {
  return typeof value === 'boolean';
}

export function isReference(
  value: FirestoreAny
): value is firestore.DocumentReference {
  return value instanceof firestore.DocumentReference;
}

export function isTimestamp(value: FirestoreAny): value is firestore.Timestamp {
  return value instanceof firestore.Timestamp;
}

export function isString(value: FirestoreAny): value is string {
  return typeof value === 'string';
}

export function isNumber(value: FirestoreAny): value is number {
  return typeof value === 'number';
}

export function isGeoPoint(value: FirestoreAny): value is firestore.GeoPoint {
  return value instanceof firestore.GeoPoint;
}

export function isMap(value: any): value is FirestoreMap {
  return getFieldType(value) === FieldType.MAP;
}

export function isArray(value: any): value is FirestoreArray {
  return getFieldType(value) === FieldType.ARRAY;
}

export function isPrimitive(value: any): value is FirestorePrimitive {
  return !isMap(value) && !isArray(value);
}

/*
  Return a copy of base with the field (specified by path) updated to value.
  This function also works with array elements. base is never modified.
*/
export const withFieldSet = produce((draft, path: string[], value: any) => {
  const parent = get(draft, getParentPath(path)) || draft;
  if (isMap(parent)) {
    parent[lastFieldName(path)] = value;
  } else if (isArray(parent)) {
    parent[Number(lastFieldName(path))] = value;
  } else {
    return value;
  }
});

/*
  Return a copy of base with the field (specified by path) deleted.
  This function also works with removing array elements. base is never modified.
*/
export const withFieldRemoved = produce((draft, path: string[]) => {
  const parent = get(draft, getParentPath(path)) || draft;
  if (isMap(parent)) {
    delete parent[lastFieldName(path)];
  } else if (isArray(parent)) {
    parent.splice(Number(lastFieldName(path)), 1);
  }
});

/**
 * Given a list of collections or documents, auto select the first item. Only
 * works on root (`/firestore`) or top level collections (`/firestore/users`)
 * to prevent deep auto selection.
 */
export function useAutoSelect<T extends { id: string }>(list?: T[] | null) {
  const { url } = useRouteMatch()!;
  const { pathname } = useLocation();
  const [autoSelect, setAutoSelect] = useState<string | undefined>(undefined);

  useEffect(() => {
    const keys = url.split('/');
    const isRootOrRootCollection =
      keys.length === 2 ||
      // /firestore
      keys.length === 3; // /firestore/users
    const hasNothingSelected = url === pathname;
    const firstChild = list?.length ? list[0] : undefined;
    const shouldAutoSelect =
      isRootOrRootCollection && hasNothingSelected && !!firstChild;

    setAutoSelect(shouldAutoSelect ? `${url}/${firstChild?.id}` : undefined);
    shouldAutoSelect && console.log('auto select', `${url}/${firstChild?.id}`);
  }, [pathname, url, list, setAutoSelect]);

  return autoSelect;
}
