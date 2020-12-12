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

import { FirestoreRulesEvaluation } from '../../components/Firestore/Requests/rules_evaluation_result_model';
import * as actions from './actions';

export interface FirestoreRequestEvaluationsState {
  requestEvaluations: FirestoreRulesEvaluation[];
  selectedRequestEvaluationId: string | null;
}

const INIT_STATE: FirestoreRequestEvaluationsState = {
  requestEvaluations: [],
  selectedRequestEvaluationId: null,
};

export const firestoreRequestEvaluationsReducer = createReducer<
  FirestoreRequestEvaluationsState,
  Action
>(INIT_STATE)
  .handleAction(actions.addRequestEvaluation, (state, { payload }) =>
    produce(state, draft => {
      draft.requestEvaluations = [payload, ...draft.requestEvaluations];
    })
  )
  .handleAction(actions.selectRequestEvaluationById, (state, { payload }) =>
    produce(state, draft => {
      draft.selectedRequestEvaluationId = payload;
    })
  );
