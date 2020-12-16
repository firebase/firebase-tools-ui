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

import {
  FirestoreRulesEvaluation,
  FirestoreRulesIssue,
  FirestoreRulesUpdateData,
  RulesOutcome,
} from './rules_evaluation_result_model';
import { sampleRules } from './sample-rules';
import { generateId } from './utils';

export interface OnEvaluationFn {
  (evaluation: FirestoreRulesEvaluation): void;
}

export interface Unsubscribe {
  (): void;
}

// TODO: Remove function when 'admin' and 'error' requests, and (rules) are received from server
// this function returns to you a mocked (RulesUpdateData) with firestore (rules) and (issues) behaviors
function injectMockedPropertiesToRequestData(
  requestUpdateData?: FirestoreRulesUpdateData,
  customOutcome?: RulesOutcome
): FirestoreRulesUpdateData {
  const mockedIssues: FirestoreRulesIssue[] = [
    {
      description: 'Mocked issue',
      severity: 'Fake',
      line: 23,
      col: 40,
    },
  ];
  const { issues, isCompilationSuccess } = requestUpdateData || {};
  return {
    isCompilationSuccess: requestUpdateData ? !!isCompilationSuccess : true,
    rules: customOutcome === 'admin' ? undefined : sampleRules,
    issues: customOutcome === 'error' ? mockedIssues : issues || [],
  };
}

// TODO: Remove function when 'admin' and 'error' requests, and (requestId) are received from server
// this function is used to generate a fake (requestId), inject a custom (outcome)
function injectMockedPropertiesToRequest(
  request: FirestoreRulesEvaluation,
  customOutcome?: RulesOutcome
): FirestoreRulesEvaluation {
  return {
    ...request,
    requestId: generateId(),
    outcome: customOutcome || request?.outcome,
    data: injectMockedPropertiesToRequestData(request?.data, customOutcome),
  };
}

/** Starts listening to a realtime feed of rule evaluations */
export function registerForRulesEvents(callback: OnEvaluationFn): Unsubscribe {
  // TODO: Replace hardcoded websocket URL (used for development purposes only)
  //       with a function that somehow gets the proper URL
  const ws = new WebSocket('ws://localhost:8888/rules/ws');
  ws.onmessage = evt => {
    const newRequest = JSON.parse(evt.data) as FirestoreRulesEvaluation;
    // TODO: Remove he following if statements when admin requests are received from server
    const probability = Math.random();
    if (probability < 0.2) {
      // there is a 20% chance that the request is transformed to an admin request
      return callback(injectMockedPropertiesToRequest(newRequest, 'admin'));
    } else if (probability > 0.9) {
      // there is a 10% chance that the request is transformed to an error request
      return callback(injectMockedPropertiesToRequest(newRequest, 'error'));
    }
    callback(injectMockedPropertiesToRequest(newRequest));
  };

  return () => ws.close();
}
