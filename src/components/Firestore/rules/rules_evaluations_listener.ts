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

export interface OnEvaluationFn {
  (evaluation: FirestoreRulesEvaluation): void;
}

export interface Unsubscribe {
  (): void;
}

/** Starts listening to a realtime feed of rule evaluations */
export function registerForRulesEvents(callback: OnEvaluationFn): Unsubscribe {
  // TODO: Actually wire this up to get results from the server.
  let unsubscribed = false;

  function scheduleOnce(): void {
    setTimeout(() => {
      if (!unsubscribed) {
        const i = Math.floor(Math.random() * 3);
        callback(DUMMY_EVALUATIONS[i]);
        scheduleOnce();
      }
    }, Math.random() * 10_000);
  }

  scheduleOnce();
  return () => (unsubscribed = true);
}

const DUMMY_EVALUATIONS: FirestoreRulesEvaluation[] = [
  {
    outcome: 'allow',
    rulesContext: {
      request: {
        method: 'get',
        path: 'databases/(default)/documents/users/foo',
        time: new Date(),
      },
      resource: {
        __name__: 'foo',
        id: 'database/(default)/documents/users/foo',
        data: {
          name: 'Foo Bar',
          accountAge: 94,
        },
      },
    },
    granularAllowOutcomes: [],
  },
  {
    outcome: 'deny',
    rulesContext: {
      request: {
        method: 'set',
        path: 'databases/(default)/documents/users/bar',
        time: new Date(),
        resource: {
          __name__: 'bar',
          id: 'database/(default)/documents/users/bar',
          data: {
            name: 'Test',
          },
        },
      },
    },
    granularAllowOutcomes: [],
  },
  {
    outcome: 'error',
    rulesContext: {
      request: {
        method: 'update',
        path: 'databases/(default)/documents/users/bar',
        time: new Date(),
      },
    },
    granularAllowOutcomes: [],
  },
];
