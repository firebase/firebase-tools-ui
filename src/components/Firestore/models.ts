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

import firebase from 'firebase';

export interface DocumentCollectionDatabaseApi<U, V> {
  projectId: string;
  databaseId: string;

  database: U;

  delete(): Promise<void>;

  getCollections(docRef?: V): Promise<firebase.firestore.CollectionReference[]>;
}

export type FirestoreApi = DocumentCollectionDatabaseApi<
  firebase.firestore.Firestore,
  firebase.firestore.DocumentReference
>;

/** Field types supported by Firestore  */
export enum FieldType {
  ARRAY = 'array',
  BLOB = 'blob',
  BOOLEAN = 'boolean',
  GEOPOINT = 'geopoint',
  JSON = 'json',
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
  | firebase.firestore.DocumentReference
  | firebase.firestore.GeoPoint
  | firebase.firestore.Blob
  | firebase.firestore.Timestamp
  | firebase.firestore.FieldValue;

export type FirestoreArray = Array<FirestorePrimitive | FirestoreMap>;

export type FirestoreMap = {
  [field: string]: FirestoreAny;
};

/** Collection filter */
export type CollectionFilterSort = 'ascending' | 'descending';

interface Filter<T extends firebase.firestore.WhereFilterOp | undefined> {
  field: string;
  operator: T;
}

type ConditionValue = number | boolean | string;

interface SingleValueCondition {
  value: ConditionValue;
}

interface MultiValueCondition {
  values: ConditionValue[];
}

interface SortableCondition {
  sort?: 'asc' | 'desc';
}

type Unspecified = Filter<undefined> & SortableCondition;
type Equal = Filter<'=='> & SingleValueCondition;
type NotEqual = Filter<'!='> & SingleValueCondition;
type GreaterThan = Filter<'>'> & SingleValueCondition & SortableCondition;
type GreaterThanEqual = Filter<'>='> & SingleValueCondition & SortableCondition;
type LessThanEqual = Filter<'<='> & SingleValueCondition & SortableCondition;
type LessThan = Filter<'<'> & SingleValueCondition & SortableCondition;
type In = Filter<'in'> & MultiValueCondition;
type NotIn = Filter<'not-in'> & MultiValueCondition;
type ArrayContains = Filter<'array-contains'> & SingleValueCondition;
type ArrayContainsAny = Filter<'array-contains-any'> & MultiValueCondition;

export type CollectionFilter =
  | Unspecified
  | Equal
  | NotEqual
  | GreaterThan
  | GreaterThanEqual
  | LessThanEqual
  | LessThan
  | In
  | NotIn
  | ArrayContains
  | ArrayContainsAny;

export function isSingleValueCollectionFilter(
  cf: CollectionFilter
): cf is Extract<CollectionFilter, SingleValueCondition> {
  return (
    cf.operator === '==' ||
    cf.operator === '!=' ||
    cf.operator === '>' ||
    cf.operator === '>=' ||
    cf.operator === '<=' ||
    cf.operator === '<' ||
    cf.operator === 'array-contains'
  );
}

export function isMultiValueCollectionFilter(
  cf: CollectionFilter
): cf is Extract<CollectionFilter, MultiValueCondition> {
  return (
    cf.operator === 'in' ||
    cf.operator === 'not-in' ||
    cf.operator === 'array-contains-any'
  );
}

export function isSortableCollectionFilter(
  cf: CollectionFilter
): cf is Extract<CollectionFilter, SortableCondition> {
  return (
    !cf.operator ||
    cf.operator === '>' ||
    cf.operator === '>=' ||
    cf.operator === '<=' ||
    cf.operator === '<'
  );
}

export interface MissingDocument {
  path: string;
}
