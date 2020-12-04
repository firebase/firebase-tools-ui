import {
  FirestoreAny,
  FirestoreArray,
  FirestoreMap,
  FirestorePrimitive,
} from '../models';
import { isPrimitive as isNativePrimitive } from '../utils';

export class DocumentPath {
  constructor(readonly path: string) {}
}

export type MapChildren = Array<{
  readonly uuid: number;
  name: string;
  valueId: number;
}>;
export interface MapField {
  mapChildren: MapChildren;
}

export type ArrayChildren = Array<{ readonly uuid: number; valueId: number }>;
export interface ArrayField {
  arrayChildren: ArrayChildren;
}

export interface JSONField {
  isJson: boolean;
  value: FirestoreAny;
}

export type PrimitiveValue = FirestorePrimitive | DocumentPath;
export interface PrimitiveField {
  value: PrimitiveValue;
}

export type Field = MapField | ArrayField | JSONField | PrimitiveField;
export type Fields = {
  [uuid: number]: Field;
};
export type Store = {
  uuid?: number;
  fields: Fields;
};

export function isPrimitive(
  data: FirestoreAny | DocumentPath
): data is PrimitiveValue {
  return isNativePrimitive(data) || data instanceof DocumentPath;
}

export function isFirestoreMap(data: FirestoreAny): data is FirestoreMap {
  return !isFirestoreArray(data) && !isPrimitive(data);
}

export function isFirestoreArray(data: FirestoreAny): data is FirestoreArray {
  return data instanceof Array;
}

export function isMapField(field: Field): field is MapField {
  return 'mapChildren' in field;
}

export function isArrayField(field: Field): field is ArrayField {
  return 'arrayChildren' in field;
}

export function isJSONField(field: Field): field is JSONField {
  return 'isJson' in field;
}

export function assertStoreHasRoot(
  store: Store
): asserts store is Store & { uuid: number } {
  if (store.uuid === undefined) {
    throw new Error('Store has no root');
  }
}

export function assertIsPrimitiveField(
  field: Field
): asserts field is PrimitiveField {
  if (!('value' in field)) {
    throw new Error('Field is not primitive');
  }
}

export function assertIsMapField(field: Field): asserts field is MapField {
  if (!isMapField(field)) {
    throw new Error('Field is not a map');
  }
}

export function assertIsArrayField(field: Field): asserts field is ArrayField {
  if (!isArrayField(field)) {
    throw new Error('Field is not an array');
  }
}
