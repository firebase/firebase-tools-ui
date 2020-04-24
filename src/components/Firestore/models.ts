/**
 * Copyright 2019 Google LLC
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

export interface DocumentCollectionDatabaseApi<U, V> {
  projectId: string;
  databaseId: string;

  database: U;

  delete(): Promise<void>;

  getCollections(docRef?: V): Promise<firestore.CollectionReference[]>;
}

export type FirestoreApi = DocumentCollectionDatabaseApi<
  firestore.Firestore,
  firestore.DocumentReference
>;

/** Field types supported by Firestore  */
export enum FieldType {
  ARRAY = 'array',
  BLOB = 'blob',
  BOOLEAN = 'boolean',
  GEOPOINT = 'geopoint',
  MAP = 'map',
  NULL = 'null',
  NUMBER = 'number',
  REFERENCE = 'reference',
  STRING = 'string',
  TIMESTAMP = 'timestamp',
}

export type FirestoreAny = FirestoreMap | FirestoreArray | FirestorePrimitive;

export type FirestorePrimitive =
  | string
  | number
  | boolean
  | null
  | firestore.DocumentReference
  | firestore.GeoPoint
  | firestore.Blob
  | firestore.Timestamp
  | firestore.FieldValue;

export type FirestoreArray = Array<FirestorePrimitive | FirestoreMap>;

export type FirestoreMap = {
  [field: string]: FirestoreAny;
};

/** Collection filter */
export type CollectionFilterSort = 'ascending' | 'descending';

// interface CollectionFilterConditionNone {
//   type: undefined;
// }
//
// interface CollectionFilterConditionSingle<
//     T extends Extract<firestore.WhereFilterOp, '<'|'<='|'=='|'>='|'>'>> {
//   type: T;
//   entry: string|number|boolean;
// }
//
// interface CollectionFilterConditionMultiple<
//     T extends Extract<
//         firestore.WhereFilterOp,
//         'array-contains'|'in'|'array-contains-any'>> {
//   type: T;
//   entries: Array<string|number|boolean>;
// }
//
// export type CollectionFilterConditionSingles =
//     |CollectionFilterConditionSingle<'<'>|CollectionFilterConditionSingle<'<='>|
//     CollectionFilterConditionSingle<'=='>|CollectionFilterConditionSingle<'>='>|
//     CollectionFilterConditionSingle<'>'>;
//
// export type CollectionFilterConditionMultiples =
//     |CollectionFilterConditionMultiple<'array-contains'>|
//     CollectionFilterConditionMultiple<'in'>|
//     CollectionFilterConditionMultiple<'array-contains-any'>;
//
// export type CollectionFilterCondition =|CollectionFilterConditionNone|
//     CollectionFilterConditionSingles|CollectionFilterConditionMultiples;
//
// export interface CollectionFilter {
//   field: string;
//   sort?: CollectionFilterSort;
//   condition: CollectionFilterCondition;
// }

// export function isCollectionFilterConditionSingle(
//     collectionFilterCondition: CollectionFilterCondition):
//     collectionFilterCondition is CollectionFilterConditionSingles {
//   return (
//       !!collectionFilterCondition.type &&
//       ['<', '<=', '==', '>=', '>'].includes(collectionFilterCondition.type));
// }
//
// export function isCollectionFilterConditionMultiple(
//     collectionFilterCondition: CollectionFilterCondition):
//     collectionFilterCondition is CollectionFilterConditionMultiples {
//   return (!!collectionFilterCondition.type && [
//     'array-contains', 'in', 'array-contains-any'
//   ].includes(collectionFilterCondition.type));
// }

export interface Condition {
  field: string;
  operator?: firestore.WhereFilterOp;
}

interface SortableCondition {
  sort?: CollectionFilterSort;
}

interface SingleValueCondition {
  value: string | number | boolean;
}

interface MultiValueCondition {
  values: Array<string | number | boolean>;
}

interface ConditionUnspecified extends Condition, SortableCondition {
  operator: undefined;
}

interface ConditionEqual extends Condition, SingleValueCondition {
  operator: '==';
}

interface ConditionGreaterThan
  extends Condition,
    SingleValueCondition,
    SortableCondition {
  operator: '>';
}

interface ConditionGreaterThanOrEqual
  extends Condition,
    SingleValueCondition,
    SortableCondition {
  operator: '>=';
}

interface ConditionLessThan
  extends Condition,
    SingleValueCondition,
    SortableCondition {
  operator: '<';
}

interface ConditionLessThanOrEqual
  extends Condition,
    SingleValueCondition,
    SortableCondition {
  operator: '<=';
}

interface ConditionIn extends Condition, MultiValueCondition {
  operator: 'in';
}

interface ConditionArrayContains extends Condition, MultiValueCondition {
  operator: 'array-contains';
}

interface ConditionArrayContainsAny extends Condition, MultiValueCondition {
  operator: 'array-contains-any';
}

export type CollectionFilter =
  | ConditionUnspecified
  | ConditionEqual
  | ConditionGreaterThan
  | ConditionGreaterThanOrEqual
  | ConditionLessThan
  | ConditionLessThanOrEqual
  | ConditionIn
  | ConditionArrayContains
  | ConditionArrayContainsAny;

export function isCollectionFilterConditionSingle(
  collectionFilter: Condition
): collectionFilter is {
  field: string;
  operator: '<' | '<=' | '==' | '>=' | '>';
} & SingleValueCondition {
  return (
    'operator' in collectionFilter &&
    !!collectionFilter.operator &&
    ['<', '<=', '==', '>=', '>'].includes(collectionFilter.operator)
  );
}

export function isCollectionFilterConditionMultiple(
  collectionFilter: Condition
): collectionFilter is {
  field: string;
  operator: 'array-contains' | 'array-contains-any' | 'in';
} & MultiValueCondition {
  return (
    !!collectionFilter.operator &&
    ['array-contains', 'array-contains-any', 'in'].includes(
      collectionFilter.operator
    )
  );
}

export function isSortableCondition(
  collectionFilter: Condition
): collectionFilter is { field: string } & SortableCondition {
  return (
    !collectionFilter.operator ||
    ['<', '<=', '>=', '>'].includes(collectionFilter.operator)
  );
}
