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

import './index.scss';

import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { AppState } from '../../../../store';
import { getSelectedRequestEvaluationById } from '../../../../store/firestore/requests/evaluations/selectors';
import { RequestDetailsRouteParams } from '../index';
import { FirestoreRulesEvaluation } from '../rules_evaluation_result_model';
import { useRequestDetailedData, useRequestMainData } from '../utils';
import RequestDetailsCodeViewer from './CodeViewer';
import RequestDetailsHeader from './Header';
import RequestDetailsInspectionSection from './InspectionSection';

interface PropsFromState {
  selectedRequest?: FirestoreRulesEvaluation;
}
interface PropsFromParentComponent extends RequestDetailsRouteParams {
  setShowCopyNotification: (value: boolean) => void;
}
interface Props extends PropsFromState, PropsFromParentComponent {}

const RequestDetails: React.FC<Props> = ({
  selectedRequest,
  requestId,
  setShowCopyNotification,
}) => {
  const [
    requestTimeComplete,
    requestTimeFormatted,
    requestMethod,
    resourcePath,
    outcomeData,
  ] = useRequestMainData(selectedRequest);
  const [
    firestoreRules,
    linesOutcome,
    linesIssues,
    inspectionElements,
  ] = useRequestDetailedData(selectedRequest);

  // Redirect to table if selected (requestId) was not valid
  if (requestId && !selectedRequest) {
    return <Redirect to="/firestore/requests" />;
  }

  return (
    <div data-testid="request-details">
      {selectedRequest && (
        <>
          <RequestDetailsHeader
            requestTimeComplete={requestTimeComplete}
            requestTimeFormatted={requestTimeFormatted}
            requestMethod={requestMethod}
            resourcePath={resourcePath}
            outcomeData={outcomeData}
            setShowCopyNotification={setShowCopyNotification}
          />
          <div className="Firestore-Request-Details-Content">
            <RequestDetailsCodeViewer
              firestoreRules={firestoreRules}
              linesOutcome={linesOutcome}
              linesIssues={linesIssues}
            />
            <RequestDetailsInspectionSection
              inspectionElements={inspectionElements}
            />
          </div>
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state: AppState, { requestId }: Props) => {
  return {
    selectedRequest: getSelectedRequestEvaluationById(state, requestId || ''),
  };
};

export default connect(mapStateToProps, null)(RequestDetails);
