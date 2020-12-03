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

import { createSelector } from 'reselect';

import { AppState } from '..';

export function getRequestEvaluations(state: AppState) {
  return state.firebaseRules.requestEvaluations;
}

export const getAllRequestEvaluations = createSelector(
  getRequestEvaluations,
  requestEvaluations => requestEvaluations
);

export const getRequestEvaluationById = (evaluationId: string) =>
  createSelector(getRequestEvaluations, requestEvaluations =>
    requestEvaluations?.find(
      evaluation => evaluation.evaluationId === evaluationId
    )
  );
