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

import { createAction } from 'typesafe-actions';

import {
  FieldType,
  FirestoreAny,
  FirestoreMap,
  FirestorePrimitive,
} from '../models';
import { NewField } from './store';

export const reset = createAction('@document/reset')<FirestoreMap>();

export const addField = createAction('@document/add')<{
  parentId?: number;
  state: NewField;
}>();
export const addArrayChildField = createAction('@document/addArrayChildField')<{
  parentId?: number;
  state: { type: FieldType; value: FirestoreAny };
}>();
export const addMapChildField = createAction('@document/addMapChildField')<{
  parentId?: number;
  state: NewField;
}>();
export const updateName = createAction('@document/updateFieldName')<{
  id: number;
  name: string;
}>();
export const updateType = createAction('@document/updateType')<{
  id: number;
  type: FieldType;
}>();
export const updateValue = createAction('@document/updateValue')<{
  id: number;
  value: FirestorePrimitive;
}>();
export const deleteField = createAction('@document/delete')<{ id: number }>();
