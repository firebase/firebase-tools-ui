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

import { FirestoreAny, FirestoreMap } from '../models';
import { isArray, isMap, withFieldRemoved, withFieldSet } from '../utils';

const DELETE_FIELD = firebase.firestore.FieldValue.delete();

export function deleteField(
  documentRef: firebase.firestore.DocumentReference,
  documentData: FirestoreMap,
  path: string[]
) {
  const payload = adjustPayloadForArray(documentData, path, DELETE_FIELD);
  documentRef.update(...payload);
}

export function updateField(
  documentRef: firebase.firestore.DocumentReference,
  documentData: FirestoreMap,
  path: string[],
  value: FirestoreAny
) {
  const payload = adjustPayloadForArray(documentData, path, value);
  documentRef.update(...payload);
}

export async function addFieldToMissingDocument(
  reference: firebase.firestore.DocumentReference,
  key: string,
  value: FirestoreAny
) {
  const snapshot = await reference.get();
  if (snapshot.exists) {
    // TODO: Better surface this to the user.
    throw new Error('.set() on an existing document would delete other fields');
  }

  await reference.set({ [key]: value });
}

/**
 * Firestore does not allow array syntax when updating/deleting fields i.e.
 * .update('obj.array[2]', true)
 *
 * This normalizes a payload's `objectPath` and `updateValue` into a form
 * that writes to the top most array with a reconstructed payload contains the
 * updated (or deleted) value.
 */
function adjustPayloadForArray(
  doc: FirestoreMap,
  fieldPath: string[],
  value: FirestoreAny | firebase.firestore.FieldValue
): [firebase.firestore.FieldPath, FirestoreAny] {
  let cur: FirestoreAny | undefined = doc;
  let parentPath: string[] = [];
  for (const key of fieldPath) {
    if (cur === undefined || !isMap(cur)) {
      throw new Error(`Tried to set field ${key} on non-map value.`);
    }
    cur = cur[key];
    parentPath.push(key);
    if (parentPath.length < fieldPath.length && isArray(cur)) {
      // Note: We're avoiding arrayUnion, arrayRemove, etc. since they may
      // skip adding or / remove all "equal" elements. Checking the edge cases
      // will require implementing Firestore deep equals locally, which is way
      // beyond the scope of this function and hard to keep in sync.
      // Instead, just overwrite the whole array, which may touch more data
      // than needed, but is always correct.
      const pathToUpdate = new firebase.firestore.FieldPath(...parentPath);
      const childPath = fieldPath.slice(parentPath.length);

      // Note: FieldValue sentinels are not guaranteed to be
      // `instanceof FieldValue`, so let's just use type casting here.
      if (value === DELETE_FIELD || DELETE_FIELD.isEqual(value as any)) {
        return [pathToUpdate, withFieldRemoved(cur, childPath)];
      } else {
        return [pathToUpdate, withFieldSet(cur, childPath, value)];
      }
    }
  }
  return [new firebase.firestore.FieldPath(...fieldPath), value];
}
