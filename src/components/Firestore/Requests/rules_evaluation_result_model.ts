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

import { ExpressionValue } from '../DocumentPreview/ExpressionValue';

/** The authentication object as seen by rules */
export interface RulesAuthObject {
  uid: string;
  token: {
    email?: string;
    email_verified?: boolean;
    phone_number?: string;
    name?: string;
    sub: string;
    firebase: {
      identities: Record<string, string>;
      sign_in_provider: string;
    };
  };
}

/** A Firestore resource that is pulled into the rules context */
export interface FirestoreResource {
  __name__: string;
  id: string;
  data: Record<string, any>;
}

/** This corresponds to the `request` variable in rules */
export interface FirestoreRulesRequest extends ExpressionValue {}

/** Everything that's in scope when rules are evaluated */
export interface FirestoreRulesContext {
  request: FirestoreRulesRequest;
  resource?: ExpressionValue;
  path: string;
  method: string;
  time: string;
}

export type RulesOutcome = 'allow' | 'deny' | 'error' | 'admin';

export interface FirestoreRulesIssue {
  description: string;
  severity: string;
  line: number;
  col: number;
}
export interface OutcomeInfo {
  line: number;
  outcome: RulesOutcome;
}
export interface FirestoreRulesUpdateData {
  isCompilationSuccess: boolean;
  issues: FirestoreRulesIssue[];
  rules?: string;
}

/** This captures everything about the evaluation, including the outcome */
export interface FirestoreRulesEvaluation {
  rulesContext: FirestoreRulesContext;
  outcome: RulesOutcome;
  requestId: string;

  // TODO: Add a more cleaned-up version of the detailed info
  granularAllowOutcomes: OutcomeInfo[];
  rules?: string;
  rulesReleaseName?: string;
  time: string;
}
