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

import React, { useEffect, useState } from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';

import { createStructuredSelector } from '../../../../store';
import { selectRequestEvaluationById } from '../../../../store/firestoreRequestEvaluations';
import { getSelectedRequestEvaluation } from '../../../../store/firestoreRequestEvaluations/selectors';
import { FirestoreRulesEvaluation } from '../../Requests/rules_evaluation_result_model';
import {
  useRequestInspectionElements,
  useRequestMainInformation,
} from '../../Requests/utils';
import CopyPathNotification from '../CopyPathNotification';
import RequestDetailsCodeViewer from './CodeViewer';
import RequestDetailsHeader from './Header';
import RequestDetailsInspectionSection from './InspectionSection';

export interface PropsFromState {
  selectedRequest?: FirestoreRulesEvaluation;
}
export interface PropsFromDispatch {
  selectRequestById: typeof selectRequestEvaluationById;
}
export type Props = PropsFromState & PropsFromDispatch;

const RequestDetails: React.FC<Props> = ({
  selectedRequest,
  selectRequestById,
}) => {
  const { requestId } = useParams<{ requestId: string }>();
  const [
    requestTimeComplete,
    requestTimeFromNow,
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

  const [wasRequestSelected, setWasRequestSelected] = useState<Boolean>(false);
  const [showCopyNotification, setShowCopyNotification] = useState<boolean>(
    false
  );

  useEffect(() => {
    selectRequestById(requestId);
    setWasRequestSelected(true);
    return () => {
      selectRequestById(null);
    };
  }, [selectRequestById, requestId]);

  if (wasRequestSelected && !selectedRequest) {
    return <Redirect to="/firestore/requests" />;
  }

  return (
    <>
      <RequestDetailsHeader
        requestTimeComplete={requestTimeComplete}
        requestTimeFromNow={requestTimeFromNow}
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

export const mapStateToProps = createStructuredSelector({
  selectedRequest: getSelectedRequestEvaluation,
});
export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = dispatch => ({
  selectRequestById: (selectedRequestId: string | null) =>
    dispatch(selectRequestEvaluationById(selectedRequestId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RequestDetails);
