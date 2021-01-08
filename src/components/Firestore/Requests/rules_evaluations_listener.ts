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

import { ReconnectingWebSocket } from '../../../reconnectingWebSocket';
import { FirestoreRulesEvaluation } from './rules_evaluation_result_model';
import { generateId } from './utils';

// TODO: Replace hardcoded websocket URL (used for development purposes only)
//       with a function that somehow gets the proper URL
const REQUESTS_EVALUATION_WEBSOCKET_HOST_AND_PORT = 'localhost:8888/rules/ws';

export type OnEvaluationFn = (evaluation: FirestoreRulesEvaluation) => void;
export type Unsubscribe = () => void;

/** Starts listening to a realtime feed of rule evaluations */
export function registerForRulesEvents(callback: OnEvaluationFn): Unsubscribe {
  const webSocket = new ReconnectingWebSocket(
    REQUESTS_EVALUATION_WEBSOCKET_HOST_AND_PORT
  );
  webSocket.listener = (newEvaluation: FirestoreRulesEvaluation) => {
    callback({ ...newEvaluation, requestId: generateId() });
  };
  return () => webSocket.cleanup();
}
