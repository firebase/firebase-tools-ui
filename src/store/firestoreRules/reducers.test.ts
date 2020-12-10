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

import { dummyRequestEvaluation } from '../../components/Firestore/Rules/test_utils';
import { addRequestEvaluation, selectRequestEvaluationById } from './actions';
import { FirestoreRulesState, firestoreRulesReducer } from './reducer';

describe('firestore rules reducer', () => {
  const INIT_STATE: FirestoreRulesState = {
    requestEvaluations: [],
    selectedRequesEvaluationId: null,
  };

  it(`${addRequestEvaluation} => adds request evaluation to beginning of array`, () => {
    const updatedState = firestoreRulesReducer(
      INIT_STATE,
      addRequestEvaluation(dummyRequestEvaluation)
    );
    const secondDummyRequestEvaluation = {
      ...dummyRequestEvaluation,
      evaluationId: 'second-dummy',
    };

    expect(
      firestoreRulesReducer(
        updatedState,
        addRequestEvaluation(secondDummyRequestEvaluation)
      )
    ).toEqual({
      requestEvaluations: [
        secondDummyRequestEvaluation,
        dummyRequestEvaluation,
      ],
      selectedRequesEvaluationId: null,
    });
  });

  it(`${selectRequestEvaluationById} => sets value of selectedRequesEvaluationId`, () => {
    expect(
      firestoreRulesReducer(
        INIT_STATE,
        selectRequestEvaluationById('newRequestEvaluationId')
      )
    ).toEqual({
      requestEvaluations: [],
      selectedRequesEvaluationId: 'newRequestEvaluationId',
    });
  });
});
