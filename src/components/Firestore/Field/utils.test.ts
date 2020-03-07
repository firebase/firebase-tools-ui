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

import { FieldType } from './models';
import { getFieldType } from './utils';

it('maps values to FieldTypes', () => {
  // constructor firestore.DocumentReference is private

  expect(getFieldType(null)).toBe(FieldType.NULL);
  expect(getFieldType(new firestore.Timestamp(0, 0))).toBe(FieldType.TIMESTAMP);
  expect(getFieldType([])).toBe(FieldType.ARRAY);
  expect(getFieldType(new firestore.GeoPoint(0, 0))).toBe(FieldType.GEOPOINT);
  expect(getFieldType(firestore.Blob.fromUint8Array(new Uint8Array(2)))).toBe(
    FieldType.BLOB
  );
  expect(getFieldType({})).toBe(FieldType.MAP);
  expect(getFieldType(true)).toBe(FieldType.BOOLEAN);
  expect(getFieldType(12)).toBe(FieldType.NUMBER);
  expect(getFieldType('')).toBe(FieldType.STRING);
});
