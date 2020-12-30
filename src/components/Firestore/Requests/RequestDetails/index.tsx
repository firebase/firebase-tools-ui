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

import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { AppState } from '../../../../store';
import { getSelectedRequestEvaluation } from '../../../../store/firestoreRequestEvaluations/selectors';
import CopyPathNotification from '../CopyPathNotification';
import {
  useRequestInspectionElements,
  useRequestMainInformation,
} from '../utils';
import RequestDetailsCodeViewer from './CodeViewer';
import RequestDetailsHeader from './Header';
import RequestDetailsInspectionSection from './InspectionSection';

interface PropsFromParentComponent {
  requestId?: string;
}
const mapStateToProps = (
  state: AppState,
  { requestId }: PropsFromParentComponent
) => {
  return {
    selectedRequest: getSelectedRequestEvaluation(state, requestId || ''),
  };
};
type PropsFromState = ReturnType<typeof mapStateToProps>;
type Props = PropsFromState & PropsFromParentComponent;

const RequestDetails: React.FC<Props> = ({ selectedRequest, requestId }) => {
  const [
    requestTimeComplete,
    requestTimeFormatted,
    requestMethod,
    resourcePath,
    outcomeData,
  ] = useRequestMainInformation(selectedRequest);
  const [
    firestoreRules,
    linesOutcome,
    linesIssues,
    inspectionElements,
  ] = useRequestInspectionElements(selectedRequest);

  const [showCopyNotification, setShowCopyNotification] = useState<boolean>(
    false
  );

  // redirect to table if selected (requestId) was not valid
  if (requestId && !selectedRequest) {
    return <Redirect to="/firestore/requests" />;
  }
  // return empty view if (selectedRequest) has not yet been selected
  else if (!selectedRequest) {
    return <></>;
  }

  return (
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
      <CopyPathNotification
        showCopyNotification={showCopyNotification}
        setShowCopyNotification={setShowCopyNotification}
      />
    </>
  );
};

export default connect(mapStateToProps, null)(RequestDetails);
