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

import { ReconnectingWebSocket } from '../../../reconnectingWebSocket';
import {
  FirestoreRulesEvaluation,
  FirestoreRulesUpdateData,
  RulesOutcome,
} from './rules_evaluation_result_model';
import { SAMPLE_RULES } from './sample-rules';

// TODO: Replace hardcoded websocket URL (used for development purposes only)
//       with a function that somehow gets the proper URL
const REQUESTS_EVALUATION_WEBSOCKET_HOST_AND_PORT = 'localhost:44327/requests';

// Returns an id made out of 20 random upper- and lower-case letters and numbers
// TODO: Remove generateId function once the backend itself generates a UID for each request
function generateId(): string {
  let newId = '';
  let options = 'ABCDEFGHIJKLMNOPQRSTUVWYZabcdefghijklmnoqrstuvwyz0123456789';
  const ID_SIZE = 20;

  for (let i = 0; i < ID_SIZE; i++) {
    newId += options.charAt(Math.floor(Math.random() * options.length));
  }

  return newId;
}

// TODO: Remove function when firestore (rules) are received from server
function injectMockPropertiesToEvaluationUpdateData(
  outcome: RulesOutcome,
  requestUpdateData?: FirestoreRulesUpdateData
): FirestoreRulesUpdateData {
  const { issues, isCompilationSuccess } = requestUpdateData || {};
  return {
    isCompilationSuccess: requestUpdateData ? !!isCompilationSuccess : true,
    rules: outcome === 'admin' ? undefined : SAMPLE_RULES,
    issues: issues || [],
  };
}

export type OnEvaluationFn = (evaluation: FirestoreRulesEvaluation) => void;
export type Unsubscribe = () => void;

/** Starts listening to a realtime feed of rule evaluations */
export function registerForRulesEvents(callback: OnEvaluationFn): Unsubscribe {
  const webSocket = new ReconnectingWebSocket(
    REQUESTS_EVALUATION_WEBSOCKET_HOST_AND_PORT
  );
  webSocket.listener = (newEvaluation: FirestoreRulesEvaluation) => {
    if (newEvaluation instanceof Array) {
      // This is the initial "blast" of prior requests
      newEvaluation.forEach(callback);
    } else {
      callback(newEvaluation);
    }
  };
  return () => webSocket.cleanup();
}
