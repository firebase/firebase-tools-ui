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

import { formatTimestamp } from '../../LogViewer/History';
import { FirestoreRulesEvaluation } from './rules_evaluation_result_model';
import { RulesOutcomeData } from './types';

// Matches the material-icon name by request outcome
const ICON_SELECTOR = {
  allow: 'check_circle',
  deny: 'remove_circle',
  error: 'report_problem',
  admin: 'security',
};

// Outputs the main data of the request in a clean format
export function useRequestMainData(request?: FirestoreRulesEvaluation) {
  if (!request) {
    return [undefined, undefined, undefined, undefined, undefined] as const;
  }

  const { rulesContext, outcome } = request;
  // time * 1000 converts timestamp units from seconds to millis
  const timestamp = rulesContext?.request?.time * 1000;
  const requestTimeComplete = new Date(timestamp).toLocaleString();
  const requestTimeFormatted = formatTimestamp(timestamp);
  const requestMethod = rulesContext?.request?.method;
  // Remove root path, split every subpath and remove resulting empty elements
  const resourcePath = rulesContext?.request?.path
    ?.replace('/databases/(default)/documents', '')
    ?.split('/')
    ?.filter((i) => i)
    ?.map((subpath) => `/${subpath}`)
    ?.join('');
  const outcomeData: RulesOutcomeData = {
    allow: { theme: 'success', icon: ICON_SELECTOR['allow'], label: 'ALLOW' },
    deny: { theme: 'warning', icon: ICON_SELECTOR['deny'], label: 'DENY' },
    error: { theme: 'warning', icon: ICON_SELECTOR['error'], label: 'ERROR' },
    admin: { theme: 'success', icon: ICON_SELECTOR['admin'], label: 'ADMIN' },
  };

  return [
    requestTimeComplete,
    requestTimeFormatted,
    requestMethod,
    resourcePath,
    outcomeData[outcome],
  ] as const;
}

// Returns an id made out of 20 random upper- and lower-case letters and numbers
// TODO: Remove generateId function once the backend itself generates a UID for each request
export function generateId(): string {
  let newId = '';
  let options = 'ABCDEFGHIJKLMNOPQRSTUVWYZabcdefghijklmnoqrstuvwyz0123456789';
  const ID_SIZE = 20;

  for (let i = 0; i < ID_SIZE; i++) {
    newId += options.charAt(Math.floor(Math.random() * options.length));
  }
  return newId;
}
