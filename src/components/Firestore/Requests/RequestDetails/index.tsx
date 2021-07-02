/**
 * Copyright 2021 Google LLC
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
import { Redirect } from 'react-router-dom';

import { useFirestoreRequest } from '../FirestoreRequestsProvider';
import { RequestDetailsRouteParams } from '../index';
import {
  FirestoreRulesContext,
  FirestoreRulesEvaluation,
  FirestoreRulesIssue,
  OutcomeInfo,
  RulesOutcome,
} from '../rules_evaluation_result_model';
import { InspectionElement, OutcomeData } from '../types';
import { OUTCOME_DATA } from '../utils';
import RequestDetailsCodeViewer from './CodeViewer/index';
import RequestDetailsHeader from './Header/index';
import RequestDetailsInspectionSection from './InspectionSection/index';

// Combines (granularAllowOutcomes) and (issues) into one array of the same type
function getLinesOutcome(
  granularAllowOutcomes: OutcomeInfo[],
  issues?: FirestoreRulesIssue[]
): OutcomeInfo[] {
  return [
    ...granularAllowOutcomes,
    ...(issues?.map(
      ({ line }): OutcomeInfo => {
        return { outcome: 'error', line };
      }
    ) || []),
  ];
}
// Transforms the (rulesContext) data into InspectionElements
function getInspectionExpressions(
  rulesContext: FirestoreRulesContext,
  outcome: RulesOutcome
): InspectionElement[] {
  if (outcome === 'admin') {
    return [];
  }

  const inspections: InspectionElement[] = [];

  // List all fields from rules `request.*`. See doc below for details.
  // https://firebase.google.com/docs/reference/rules/rules.firestore.Request
  for (const field of ['auth', 'method', 'path', 'query', 'resource', 'time']) {
    const value = rulesContext.request.mapValue?.fields?.[field];
    if (value) {
      inspections.push({
        label: `request.${field}`,
        value: value,
      });
    }
  }

  if (rulesContext.resource) {
    inspections.push({
      label: 'resource',
      value: rulesContext.resource,
    });
  }

  return inspections;
}
interface DetailedRequestData {
  requestTimeComplete?: string;
  requestTimeFormatted?: string;
  requestMethod?: string;
  resourcePath?: string;
  outcome?: RulesOutcome;
  outcomeData?: OutcomeData;
  firestoreRules?: string;
  linesOutcome?: OutcomeInfo[];
  inspectionExpressions?: InspectionElement[];
}
// Outputs (in a clean format) the request data used by the RequestDetails component
export function getDetailsRequestData(
  request?: FirestoreRulesEvaluation
): DetailedRequestData {
  if (!request) {
    return {};
  }
  const { rulesContext, granularAllowOutcomes, rules, outcome } = request;
  // (time * 1000) converts timestamp units from seconds to milliseconds
  const requestDate = new Date(rulesContext.time);
  return {
    requestTimeComplete: requestDate.toLocaleString(),
    requestTimeFormatted: requestDate.toLocaleTimeString('en-US', {
      hour12: false,
    }),
    requestMethod: rulesContext.method,
    resourcePath: rulesContext.path.replace(
      '/databases/(default)/documents',
      ''
    ),
    outcome,
    outcomeData: OUTCOME_DATA[outcome],
    firestoreRules: rules,
    linesOutcome: getLinesOutcome(granularAllowOutcomes),
    inspectionExpressions: getInspectionExpressions(rulesContext, outcome),
  };
}

interface PropsFromParentComponent extends RequestDetailsRouteParams {
  setShowCopyNotification: (value: boolean) => void;
}

interface Props extends PropsFromParentComponent {
  selectedRequest: FirestoreRulesEvaluation | undefined;
}

export const RequestDetails: React.FC<Props> = ({
  selectedRequest,
  requestId,
  setShowCopyNotification,
}) => {
  const {
    requestTimeComplete,
    requestTimeFormatted,
    requestMethod,
    resourcePath,
    outcome,
    outcomeData,
    firestoreRules,
    linesOutcome,
    inspectionExpressions,
  } = getDetailsRequestData(selectedRequest);

  // Redirect to requests-table if (requestId) did not match any existing request
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
              isAdminRequest={outcome === 'admin'}
            />
            <RequestDetailsInspectionSection
              inspectionExpressions={inspectionExpressions}
            />
          </div>
        </>
      )}
    </div>
  );
};

export const RequestDetailsWrapper: React.FC<PropsFromParentComponent> = (
  props
) => {
  const selectedRequest = useFirestoreRequest(props.requestId);

  return <RequestDetails selectedRequest={selectedRequest} {...props} />;
};
export default RequestDetailsWrapper;
