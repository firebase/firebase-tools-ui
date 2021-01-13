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
import { useRequestDetailedData, useRequestMainData } from '../utils';
import RequestDetailsCodeViewer from './CodeViewer';
import RequestDetailsHeader from './Header';
import RequestDetailsInspectionSection from './InspectionSection';

const mapStateToProps = (
  state: AppState,
  { requestId }: RequestDetailsRouteParams
) => {
  return {
    selectedRequest: getSelectedRequestEvaluationById(state, requestId || ''),
  };
};
interface PropsFromStore extends ReturnType<typeof mapStateToProps> {}
interface Props extends PropsFromStore, RequestDetailsRouteParams {}

export const RequestDetails: React.FC<Props> = ({
  selectedRequest,
  requestId,
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

  // Redirect to requests table if selected (requestId) did not match any request
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

export default connect(mapStateToProps)(RequestDetails);
