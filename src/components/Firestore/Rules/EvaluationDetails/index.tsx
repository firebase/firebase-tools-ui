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
import { useParams } from 'react-router-dom';

import { createStructuredSelector } from '../../../../store';
import { getRequestEvaluationById } from '../../../../store/firestoreRules';
import { getSelectedRequestEvaluation } from '../../../../store/firestoreRules/selectors';
import { FirestoreRulesEvaluation } from '../rules_evaluation_result_model';
import { sampleRules } from '../sample-rules';
import {
  useEvaluationDetailedInformation,
  useEvaluationMainInformation,
} from '../utils';
import EvaluationDetailsCode from './CodeViewer';
import EvaluationDetailsHeader from './Header';
import EvaluationDetailsInspectionSection from './InspectionSection';

export interface PropsFromState {
  selectedEvaluation: FirestoreRulesEvaluation | undefined;
}

export interface PropsFromDispatch {
  getEvaluationById: typeof getRequestEvaluationById;
}

export type Props = PropsFromState & PropsFromDispatch;

const EvaluationDetails: React.FC<Props> = ({
  selectedEvaluation,
  getEvaluationById,
}) => {
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const [
    requestTimeComplete,
    requestTimeFromNow,
    requestMethod,
    resourceSubPaths,
    outcomeData,
  ] = useEvaluationMainInformation(selectedEvaluation);

  const [linesOutcome, inspectionElements] = useEvaluationDetailedInformation(
    selectedEvaluation
  );

  useEffect(() => {
    getEvaluationById(evaluationId);
  }, [getEvaluationById, evaluationId, selectedEvaluation]);

  return (
    <>
      <EvaluationDetailsHeader
        requestTimeComplete={requestTimeComplete}
        requestTimeFromNow={requestTimeFromNow}
        requestMethod={requestMethod}
        resourceSubPaths={resourceSubPaths}
        outcomeData={outcomeData}
      />
      <div className="Firestore-Evaluation-Details-Content">
        <EvaluationDetailsCode
          linesOutcome={linesOutcome}
          firestoreRules={sampleRules}
        />
        <EvaluationDetailsInspectionSection
          inspectionElements={inspectionElements}
        />
      </div>
    </>
  );
};

export const mapStateToProps = createStructuredSelector({
  selectedEvaluation: getSelectedRequestEvaluation,
});
export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = dispatch => ({
  getEvaluationById: (selectedEvaluationId: string | null) =>
    dispatch(getRequestEvaluationById(selectedEvaluationId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EvaluationDetails);
