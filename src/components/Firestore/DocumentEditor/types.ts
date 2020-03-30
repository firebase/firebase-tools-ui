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
  readonly id: number;
  name: string;
  valueId: number;
}>;
export interface MapField {
  mapChildren: MapChildren;
}

export type ArrayChildren = Array<{ readonly id: number; valueId: number }>;
export interface ArrayField {
  arrayChildren: ArrayChildren;
}

export type PrimitiveValue = FirestorePrimitive | DocumentPath;
export interface PrimitiveField {
  value: PrimitiveValue;
}

export type Field = MapField | ArrayField | PrimitiveField;
export type Fields = {
  [id: number]: Field;
};
export type Store = {
  id?: number;
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

export function assertStoreHasRoot(
  store: Store
): asserts store is Store & { id: number } {
  if (store.id === undefined) {
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
