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

import { FirestoreRulesEvaluation } from '../../components/Firestore/Requests/rules_evaluation_result_model';
import { addRequestEvaluation, selectRequestEvaluationById } from './actions';
import {
  FirestoreRequestEvaluationsState,
  firestoreRequestEvaluationsReducer,
} from './reducer';

const dummyRequestEvaluation: FirestoreRulesEvaluation = {
  outcome: 'allow',
  rulesContext: {
    request: {
      method: 'get',
      path: 'databases/(default)/documents/users/foo',
      time: new Date().getTime(),
    },
    resource: {
      __name__: 'foo',
      id: 'database/(default)/documents/users/foo',
      data: {
        name: 'Foo Bar',
        accountAge: 94,
      },
    },
  },
  requestId: 'unique_id',
  granularAllowOutcomes: [],
};

describe('firestore request evaluations reducer', () => {
  const INIT_STATE: FirestoreRequestEvaluationsState = {
    requestEvaluations: [],
    selectedRequestEvaluationId: null,
  };

  it(`${addRequestEvaluation} => adds request evaluation to beginning of array`, () => {
    const updatedState = firestoreRequestEvaluationsReducer(
      INIT_STATE,
      addRequestEvaluation(dummyRequestEvaluation)
    );
    const secondDummyRequestEvaluation = {
      ...dummyRequestEvaluation,
      requestId: 'second-dummy',
    };

    expect(
      firestoreRequestEvaluationsReducer(
        updatedState,
        addRequestEvaluation(secondDummyRequestEvaluation)
      )
    ).toEqual({
      requestEvaluations: [
        secondDummyRequestEvaluation,
        dummyRequestEvaluation,
      ],
      selectedRequestEvaluationId: null,
    });
  });

  it(`${selectRequestEvaluationById} => sets value of selectedRequestEvaluationId to a string`, () => {
    expect(
      firestoreRequestEvaluationsReducer(
        INIT_STATE,
        selectRequestEvaluationById('unique-request-id')
      )
    ).toEqual({
      requestEvaluations: [],
      selectedRequestEvaluationId: 'unique-request-id',
    });
  });

  it(`${selectRequestEvaluationById} => sets value of selectedRequestEvaluationId to null`, () => {
    expect(
      firestoreRequestEvaluationsReducer(
        { ...INIT_STATE, selectedRequestEvaluationId: 'unique-request-id' },
        selectRequestEvaluationById(null)
      )
    ).toEqual({
      requestEvaluations: [],
      selectedRequestEvaluationId: null,
    });
  });
});
