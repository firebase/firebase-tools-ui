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

import produce from 'immer';
import { Action, createReducer } from 'typesafe-actions';

import { replaceIfChanged } from '../utils';
import { fetchError, fetchRequest, fetchSuccess } from './actions';
import { ConfigState } from './types';

export const configReducer = createReducer<ConfigState, Action>({
  loading: false,
})
  .handleAction(fetchRequest, state =>
    produce(state, draft => {
      draft.loading = true;
    })
  )
  .handleAction(fetchSuccess, (state, { payload }) =>
    produce(state, draft => {
      draft.loading = false;
      replaceIfChanged(draft, 'result', { data: payload });
    })
  )
  .handleAction(fetchError, (state, { payload }) =>
    produce(state, draft => {
      draft.loading = false;
      replaceIfChanged(draft, 'result', { error: payload });
    })
  );
