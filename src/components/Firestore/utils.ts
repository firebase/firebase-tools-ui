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

export function getLeafPath(path: string[]) {
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

  if (typeof value.valueOf() === 'object') {
    return FieldType.MAP;
  }

  return typeof value.valueOf() as FieldType;
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
