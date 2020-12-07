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

import '../index.scss';
import './index.scss';

import React, { useEffect } from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';

import { createStructuredSelector } from '../../../../store';
import { addRequestEvaluation } from '../../../../store/firestoreRules';
import { getAllRequestEvaluations } from '../../../../store/firestoreRules/selectors';
import { FirestoreRulesEvaluation } from '../rules_evaluation_result_model';
import { registerForRulesEvents } from '../rules_evaluations_listener';
import EvaluationsTableRow from './TableRow';

export interface PropsFromState {
  evaluations: FirestoreRulesEvaluation[] | undefined;
}
export interface PropsFromDispatch {
  addEvaluation: typeof addRequestEvaluation;
}

export type Props = PropsFromState & PropsFromDispatch;

const EvaluationsTable: React.FC<Props> = ({ evaluations, addEvaluation }) => {
  useEffect(() => {
    const callbackFunction = (newEvaluation: FirestoreRulesEvaluation) => {
      const { type } = newEvaluation;
      if (type === 'RULES_UPDATE') {
        // TODO: UPDATE RULES
      } else {
        addEvaluation(newEvaluation);
      }
    };
    const unsubscribeFromRules = registerForRulesEvents(callbackFunction);
    return () => unsubscribeFromRules();
  }, [addEvaluation]);

  return (
    <table className="Firestore-Evaluations-Table">
      <thead>
        <tr>
          <th></th>
          <th className="Firestore-Evaluations-Table-Method-Header">Method</th>
          <th className="Firestore-Evaluations-Table-Path-Header">Path</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {evaluations?.map((evaluation: FirestoreRulesEvaluation) => {
          const { evaluationId } = evaluation;
          return (
            <EvaluationsTableRow
              key={evaluationId}
              evaluationId={evaluationId}
              evaluation={evaluation}
            />
          );
        })}
      </tbody>
    </table>
  );
};

export const mapStateToProps = createStructuredSelector({
  evaluations: getAllRequestEvaluations,
});
export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = dispatch => ({
  addEvaluation: (newEvaluation: FirestoreRulesEvaluation) =>
    dispatch(addRequestEvaluation(newEvaluation)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EvaluationsTable);
