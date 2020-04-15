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

import { FirestoreAny, FirestoreMap } from '../models';
import { isArray, isMap, withFieldRemoved, withFieldSet } from '../utils';

export function deleteField(
  documentRef: firestore.DocumentReference,
  documentData: FirestoreMap,
  path: string[]
) {
  const payload = adjustPayloadForArray(
    documentData,
    path,
    firestore.FieldValue.delete()
  );
  documentRef.update(...payload);
}

export function updateField(
  documentRef: firestore.DocumentReference,
  documentData: FirestoreMap,
  path: string[],
  value: FirestoreAny
) {
  const payload = adjustPayloadForArray(documentData, path, value);
  documentRef.update(...payload);
}

export async function addFieldToMissingDocument(
  reference: firestore.DocumentReference,
  key: string,
  value: FirestoreAny
) {
  const snapshot = await reference.get();
  if (snapshot.exists) {
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
  value: FirestoreAny | firestore.FieldValue
): [firestore.FieldPath, FirestoreAny] {
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
      const pathToUpdate = new firestore.FieldPath(...parentPath);
      const childPath = fieldPath.slice(parentPath.length);
      if (
        value instanceof firestore.FieldValue &&
        value.isEqual(firestore.FieldValue.delete())
      ) {
        return [pathToUpdate, withFieldRemoved(cur, childPath)];
      } else {
        return [pathToUpdate, withFieldSet(cur, childPath, value)];
      }
    }
  }
  return [new firestore.FieldPath(...fieldPath), value];
}
