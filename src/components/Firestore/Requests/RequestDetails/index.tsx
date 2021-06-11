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

import firebase from 'firebase';
import React from 'react';
import { Redirect } from 'react-router-dom';

import {
  FirestoreAny,
  FirestoreArray,
  FirestoreMap,
  FirestorePrimitive,
} from '../../models';
import { useFirestoreRequest } from '../FirestoreRequestsProvider';
import { RequestDetailsRouteParams } from '../index';
import {
  FirestoreRulesContext,
  FirestoreRulesEvaluation,
  FirestoreRulesIssue,
  OutcomeInfo,
  RulesOutcome,
  RulesValue,
} from '../rules_evaluation_result_model';
import { InspectionElement, OutcomeData } from '../types';
import { OUTCOME_DATA } from '../utils';
import RequestDetailsCodeViewer from './CodeViewer/index';
import RequestDetailsHeader from './Header/index';
import RequestDetailsInspectionSection from './InspectionSection/index';

function convertTimestamp(ts: string): firebase.firestore.Timestamp {
  const date = new Date(ts);
  return new firebase.firestore.Timestamp(
    date.getSeconds(),
    date.getMilliseconds() * 1000000
  );
}

function convertPath(path: string): string {
  // return firebase.firestore().doc(path);
  return path;
}

function convertPrimitiveValue(primitive: RulesValue): FirestorePrimitive {
  if ('nullValue' in primitive) {
    return null;
  }
  if ('stringValue' in primitive) {
    return primitive.stringValue as string;
  }
  if ('timestampValue' in primitive) {
    return convertTimestamp(primitive.timestampValue!);
  }
  if ('pathValue' in primitive) {
    return convertPath(
      primitive.pathValue!.segments.map(({ simple }) => simple).join('/')
    );
  }
  if ('boolValue' in primitive) {
    return primitive.boolValue!;
  }
  if ('intValue' in primitive) {
    return primitive.intValue!;
  }
  if ('floatValue' in primitive) {
    return primitive.floatValue!;
  }
  throw new Error('Not a primitive type ' + JSON.stringify(primitive));
}

function convertArrayValue(array: RulesValue): FirestoreArray {
  if (array.listValue) {
    return array.listValue.values.map((value) => {
      if (value.mapValue) {
        return convertFirestoreMap(value);
      } else {
        return convertPrimitiveValue(value);
      }
    });
  }
  throw new Error('Not a list type');
}

function convertFirestoreMap(map: RulesValue): FirestoreMap {
  if (map.mapValue) {
    const out: FirestoreMap = {};
    for (const key of Object.keys(map.mapValue.fields)) {
      out[key] = convertRulesTypeToFirestoreAny(map.mapValue.fields[key]);
    }
    return out;
  }
  throw new Error('Not a map type: ' + JSON.stringify(map));
}

function convertRulesTypeToFirestoreAny(object: RulesValue): FirestoreAny {
  if (object.mapValue) {
    return convertFirestoreMap(object);
  } else if (object.listValue) {
    return convertArrayValue(object);
  } else {
    return convertPrimitiveValue(object);
  }
}

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

  const inspections: InspectionElement[] = [
    // Do the special one-off ones first
    {
      label: 'request.method',
      value: rulesContext.method,
    },
    {
      label: 'request.path',
      value: convertPath(rulesContext.path),
    },
    {
      label: 'request.time',
      value: convertTimestamp(rulesContext.time),
    },
  ];

  if (rulesContext.request.resource) {
    inspections.push({
      label: 'request.resource',
      value: convertRulesTypeToFirestoreAny(rulesContext.request.resource),
    });
  }

  if (rulesContext.resource) {
    inspections.push({
      label: 'resource',
      value: convertRulesTypeToFirestoreAny(rulesContext.resource),
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
