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

import { FirestoreRulesEvaluation } from './rules_evaluation_result_model';
import { generateId } from './utils';

export interface OnEvaluationFn {
  (evaluation: FirestoreRulesEvaluation): void;
}

export interface Unsubscribe {
  (): void;
}

/** Starts listening to a realtime feed of rule evaluations */
export function registerForRulesEvents(callback: OnEvaluationFn): Unsubscribe {
  const ws = new WebSocket('ws://localhost:8888/rules/ws');
  ws.onmessage = evt => {
    const newEvaluation: FirestoreRulesEvaluation = JSON.parse(evt.data);
    callback({ ...newEvaluation, evaluationId: generateId() });
  };

  return () => ws.close();
}
