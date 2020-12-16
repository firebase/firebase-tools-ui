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

import moment from 'moment';

import { InspectionElement, RulesOutcomeData } from '../Requests/types';
import {
  FirestoreRulesEvaluation,
  RulesOutcome,
} from './rules_evaluation_result_model';

const iconSelector = {
  allow: 'check',
  deny: 'close',
  error: 'warning',
  admin: 'verified_user',
};

// outputs the detailed data of the request in a clean format
export function getIconFromRequestOutcome(outcome?: RulesOutcome) {
  if (!outcome) {
    return '';
  }
  return iconSelector[outcome];
}

// outputs the main data of the request in a clean format
export function useRequestMainInformation(request?: FirestoreRulesEvaluation) {
  if (!request) {
    return [undefined, undefined, undefined, undefined, undefined] as const;
  }

  const { rulesContext, outcome } = request;
  // time * 1000 converts timestamp units from seconds to millis
  const requestTimeMoment = moment(rulesContext?.request?.time * 1000);
  const requestTimeComplete = requestTimeMoment.format(
    'MMMM Do YYYY, h:mm:ss A'
  );
  const requestTimeFromNow = requestTimeMoment.fromNow();
  const requestMethod = rulesContext?.request?.method;
  // replace root path, split every subpath and remove resulting empty elements
  const resourcePath = rulesContext?.request?.path
    ?.replace('/databases/(default)/documents', '')
    ?.split('/')
    ?.filter(i => i)
    ?.map(subpath => `/ ${subpath} `)
    ?.join('');
  const outcomeData: RulesOutcomeData = {
    allow: { theme: 'success', icon: iconSelector['allow'], label: 'ALLOW' },
    deny: { theme: 'warning', icon: iconSelector['deny'], label: 'DENY' },
    error: { theme: 'caution', icon: iconSelector['error'], label: 'ERROR' },
    admin: { theme: 'note', icon: iconSelector['admin'], label: 'ADMIN' },
  };

  return [
    requestTimeComplete,
    requestTimeFromNow,
    requestMethod,
    resourcePath,
    outcomeData[outcome],
  ] as const;
}

// outputs the detailed data of the request in a clean format
export function useRequestInspectionElements(
  request?: FirestoreRulesEvaluation
) {
  if (!request) {
    return [undefined, undefined, undefined, undefined] as const;
  }

  const { rulesContext, data, granularAllowOutcomes } = request;
  const firestoreRules = data?.rules;
  const linesOutcome = granularAllowOutcomes;
  const linesIssues = data?.issues;
  const inspectionElements = Object.entries(rulesContext || {}).map(
    ([key, value]) => {
      return {
        label: key,
        value: JSON.stringify(value, null, '\t'),
      } as InspectionElement;
    }
  );

  return [
    firestoreRules,
    linesOutcome,
    linesIssues,
    inspectionElements,
  ] as const;
}

// returns an id made out of 20 random upper- and lower-case letters and numbers
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
