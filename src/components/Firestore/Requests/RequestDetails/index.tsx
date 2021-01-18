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
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { AppState } from '../../../../store';
import { getSelectedRequestEvaluationById } from '../../../../store/firestore/requests/evaluations/selectors';
import { formatTimestamp } from '../../../../utils';
import { RequestDetailsRouteParams } from '../index';
import {
  FirestoreRulesContext,
  FirestoreRulesEvaluation,
  FirestoreRulesIssue,
  OutcomeInfo,
} from '../rules_evaluation_result_model';
import { InspectionElement, OutcomeData } from '../types';
import { OUTCOME_DATA } from '../utils';
import RequestDetailsCodeViewer from './CodeViewer';
import RequestDetailsHeader from './Header';
import RequestDetailsInspectionSection from './InspectionSection';

// TODO: remove this mock array when this data comes from the server
const INSPECTION_QUERY_DATA: InspectionElement[] = [
  { label: 'limit', value: '20' },
  { label: 'orderBy', value: 'total_reviews' },
  { label: 'where', value: "name == 'Pozole'\navg_review_rate > 4" },
];

// Combines (granularAllowOutcomes) and (issues) into one array of the same type
function getLinesOutcome(
  granularAllowOutcomes: OutcomeInfo[],
  issues?: FirestoreRulesIssue[]
): OutcomeInfo[] {
  return [
    ...granularAllowOutcomes,
    ...issues?.map(
      ({ line }): OutcomeInfo => {
        return { outcome: 'error', line };
      }
    ),
  ];
}
// Transforms the (rulesContext) data into InspectionElements
function getInspectionExpressions(
  rulesContext: FirestoreRulesContext
): InspectionElement[] {
  return Object.entries(rulesContext).map(
    ([key, value]): InspectionElement => {
      return {
        label: key,
        value: JSON.stringify(value, null, '\t'),
      };
    }
  );
}
interface DetailedRequestData {
  requestTimeComplete?: string;
  requestTimeFormatted?: string;
  requestMethod?: string;
  resourcePath?: string;
  outcomeData?: OutcomeData;
  firestoreRules?: string;
  linesOutcome?: OutcomeInfo[];
  inspectionExpressions?: InspectionElement[];
  inspectionQueryData?: InspectionElement[];
}
// Outputs (in a clean format) the request data used by the RequestDetails component
export function getDetailsRequestData(
  request?: FirestoreRulesEvaluation
): DetailedRequestData {
  if (!request) {
    return {};
  }
  const { rulesContext, granularAllowOutcomes, data, outcome } = request;
  // (time * 1000) converts timestamp units from seconds to milliseconds
  const timestamp = rulesContext.request.time * 1000;
  const requestDate = new Date(timestamp);
  return {
    requestTimeComplete: requestDate.toLocaleString(),
    requestTimeFormatted: requestDate.toLocaleTimeString('en-US', {
      hour12: false,
    }),
    requestMethod: rulesContext.request.method,
    resourcePath: rulesContext.request.path.replace(
      '/databases/(default)/documents',
      ''
    ),
    outcomeData: OUTCOME_DATA[outcome],
    firestoreRules: data?.rules,
    linesOutcome: getLinesOutcome(granularAllowOutcomes, data?.issues),
    inspectionExpressions: getInspectionExpressions(rulesContext),
    inspectionQueryData: INSPECTION_QUERY_DATA,
  };
}

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
  const {
    requestTimeComplete,
    requestTimeFormatted,
    requestMethod,
    resourcePath,
    outcomeData,
    firestoreRules,
    linesOutcome,
    inspectionExpressions,
    inspectionQueryData,
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
          />
          <div className="Firestore-Request-Details-Content">
            <RequestDetailsCodeViewer
              firestoreRules={firestoreRules}
              linesOutcome={linesOutcome}
            />
            <RequestDetailsInspectionSection
              inspectionExpressions={inspectionExpressions}
              inspectionQueryData={inspectionQueryData}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default connect(mapStateToProps)(RequestDetails);
