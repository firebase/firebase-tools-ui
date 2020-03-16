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

import { FirestoreArray, FirestoreAny, FirestoreMap } from '../models';
import { isMap, isArray } from '../utils';

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
  documentRef.update(payload);
}

export function updateField(
  documentRef: firestore.DocumentReference,
  documentData: FirestoreMap,
  path: string[],
  value: FirestoreAny
) {
  const payload = adjustPayloadForArray(documentData, path, value);
  documentRef.update(payload);
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
): FirestoreMap {
  if (fieldPath.length === 1) {
    return { [fieldPath[0]]: value };
  }

  let nestedObjectToModify: FirestoreMap | FirestoreArray = doc;
  let topLevelArray: FirestoreArray | undefined = undefined;
  let topLevelKey: string[] = [];
  fieldPath.slice(0, -1).forEach((pathSegment, index) => {
    if (isMap(nestedObjectToModify)) {
      nestedObjectToModify = nestedObjectToModify[pathSegment] as FirestoreMap;
    } else if (isArray(nestedObjectToModify)) {
      nestedObjectToModify = nestedObjectToModify[
        parseInt(pathSegment)
      ] as FirestoreMap;
    }
    if (nestedObjectToModify instanceof Array && !topLevelArray) {
      topLevelArray = nestedObjectToModify;
      topLevelKey = fieldPath.slice(0, index + 1);
    }
  });

  // If no array was found, carry on as usual
  if (!topLevelArray) {
    return { [fieldPath.join('.')]: value };
  }

  const nestedFieldId = fieldPath[fieldPath.length - 1];
  if (value !== firestore.FieldValue.delete()) {
    // Example:
    // {
    //   foo: [             <-- foo == topLevelArray
    //     {
    //       bar: {         <-- bar == nestedObjectToModify
    //         baz: 'test'  <-- 'baz' == nestedFieldId
    //       }
    //     }
    //   ]
    // }

    if (topLevelArray === nestedObjectToModify) {
      return {
        [topLevelKey.join('.')]: firestore.FieldValue.arrayUnion(value),
      };
    }
    nestedObjectToModify[nestedFieldId] = value;
  } else {
    // Deal with deleting from an array
    if (nestedObjectToModify instanceof Array) {
      if (nestedObjectToModify !== topLevelArray) {
        nestedObjectToModify.splice(Number(nestedFieldId), 1);
        return { [topLevelKey.join('.')]: topLevelArray };
      }
      // In this case we are modifying the array itself
      // Example:
      // {
      //   foo: [  <-- foo == topLevelArray, nestedObjectToModify
      //     'a',
      //     'b',  <-- 1 == nestedFieldId (index, to be deleted)
      //     'c',
      //   ]
      // }

      // nestedObjectToModify.splice(Number(nestedFieldId), 1);
      return {
        [topLevelKey.join('.')]: firestore.FieldValue.arrayRemove(
          nestedObjectToModify[Number(nestedFieldId)]
        ),
      };
    } else {
      // Otherwise, we are modifying a descendant of the array
      // Example:
      // {
      //   foo: [            <-- foo == topLevelArray
      //     'a',
      //     'b',
      //     {
      //       bar: {        <-- bar == nestedObjectToModify
      //         baz: 'qux'  <-- 'baz' == nestedFieldId (to be deleted)
      //       }
      //     }
      //   ]
      // }
      delete nestedObjectToModify[nestedFieldId];
    }
  }

  return { [topLevelKey.join('.')]: topLevelArray };
}
