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

/**
 * Max nodes shown underneath each
 */
export const DEFAULT_PAGE_SIZE = 50;

export const NO_CHILDREN: string[] = [];

export interface ViewModel {
  isLoading: boolean;
  isRealtime?: boolean;
  value?: string;
  children: string[];
}

export interface QueryParams {
  key?: string;
  operator?: '>=' | '==' | '<=';
  value?: string;
  limit?: number;
}

export const DEFAULT_QUERY_PARAMS: QueryParams = {
  limit: DEFAULT_PAGE_SIZE,
};

export enum ChildrenDisplayType {
  Table = 'table',
  TreeView = 'tree',
}

/** Try to json parse a value, else assume string. */
export function jsonIshValue(value: string) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}
