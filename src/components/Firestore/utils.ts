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
import produce from 'immer';
import get from 'lodash.get';

import {
  FieldType,
  FirestoreAny,
  FirestoreArray,
  FirestoreMap,
  FirestorePrimitive,
} from './models';

/** Firestore supported numbers */
export const NUMBER_REGEX = /^-?([\d]*\.?\d+|Infinity|NaN)$/;

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

  if (value instanceof firebase.firestore.Timestamp) {
    return FieldType.TIMESTAMP;
  }

  if (value instanceof Array) {
    return FieldType.ARRAY;
  }

  if (value instanceof firebase.firestore.DocumentReference) {
    return FieldType.REFERENCE;
  }

  if (value instanceof firebase.firestore.GeoPoint) {
    return FieldType.GEOPOINT;
  }

  if (value instanceof firebase.firestore.Blob) {
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
): value is firebase.firestore.DocumentReference {
  return value instanceof firebase.firestore.DocumentReference;
}

export function isTimestamp(
  value: FirestoreAny
): value is firebase.firestore.Timestamp {
  return value instanceof firebase.firestore.Timestamp;
}

export function isString(value: FirestoreAny): value is string {
  return typeof value === 'string';
}

export function isNumber(value: FirestoreAny): value is number {
  return typeof value === 'number';
}

export function isGeoPoint(
  value: FirestoreAny
): value is firebase.firestore.GeoPoint {
  return value instanceof firebase.firestore.GeoPoint;
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

// Give a brief text summary of the data.
// Note: maxLen is soft (at least for now). End result may still be longer.
export function summarize(data: FirestoreAny, maxLen: number): string {
  switch (getFieldType(data)) {
    case FieldType.ARRAY:
      return summarizeArray(data as FirestoreAny[], maxLen);
    case FieldType.MAP:
      return summarizeMap(data as Record<string, FirestoreAny>, maxLen);
    case FieldType.BLOB:
      const base64 = (data as firebase.firestore.Blob).toBase64();
      if (base64.length < maxLen) return base64;
      else return base64.substr(0, maxLen) + '...';
    case FieldType.BOOLEAN:
      return (data as boolean).toString();
    case FieldType.GEOPOINT:
      const value = data as firebase.firestore.GeoPoint;
      return `[${latStr(value.latitude)}, ${longStr(value.longitude)}]`;
    case FieldType.NULL:
      return 'null';
    case FieldType.NUMBER:
      return (data as number).toString();
    case FieldType.REFERENCE:
      return (data as firebase.firestore.DocumentReference).path;
    case FieldType.STRING:
      return `"${data as string}"`;
    case FieldType.TIMESTAMP:
      // TODO: Better date time formatting.
      // Note: Not using toLocaleString() since it does not stringify timezone.
      return (data as firebase.firestore.Timestamp).toDate().toString();
    case FieldType.JSON:
      throw new Error('JSON field type is input only');
  }
}

function summarizeArray(array: FirestoreAny[], maxLen: number): string {
  let output = '[';
  for (const element of array) {
    if (output.length > 1) output += ', ';
    if (output.length > maxLen) {
      output += '...';
      break;
    }
    output += summarize(element, maxLen - output.length);
  }
  output += ']';
  return output;
}

function summarizeMap(
  map: Record<string, FirestoreAny>,
  maxLen: number
): string {
  let output = '{';
  for (const [key, value] of Object.entries(map).sort((a, b) =>
    compareFirestoreKeys(a[0], b[0])
  )) {
    if (output.length > 1) output += ', ';
    if (output.length > maxLen) {
      output += '...';
      break;
    }
    output += `${key}: ${summarize(value, maxLen - output.length)}`;
  }
  output += '}';
  return output;
}

function latStr(lat: number): string {
  return `${Math.abs(lat)}° ${lat >= 0 ? 'N' : 'S'}`;
}

function longStr(long: number): string {
  return `${Math.abs(long)}° ${long >= 0 ? 'E' : 'W'}`;
}

export function compareFirestoreKeys(fieldA: string, fieldB: string): number {
  // TODO: Use UTF-8 encoded byte order instead of localCompare to match Firestore production behavior https://firebase.google.com/docs/firestore/manage-data/data-types
  return fieldA.localeCompare(fieldB);
}
