/**
 * Copyright 2019 Google LLC
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

import './EvaluationsTable.scss';

import { IconButton } from '@rmwc/icon-button';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { CustomThemeProvider, CustomThemeType } from '../../../themes';
import { FirestoreRulesEvaluation } from './rules_evaluation_result_model';
import { registerForRulesEvents } from './rules_evaluations_listener';

interface RulesOutcomeData {
  [outcome: string]: {
    theme: CustomThemeType;
    icon: string;
    label: string;
  };
}

export const EvaluationsTable: React.FC<{}> = () => {
  const [evaluations, setEvaluations] = useState<FirestoreRulesEvaluation[]>(
    []
  );

  useEffect(() => {
    const callbackFunction = (newEvaluation: FirestoreRulesEvaluation) => {
      console.log('dev: newEvaluation', newEvaluation);
      const { type } = newEvaluation;
      if (type === 'RULES_UPDATE') {
        // TODO: UPDATE RULES
      } else {
        setEvaluations(evaluations => [newEvaluation, ...evaluations]);
      }
    };
    const unsubscribeFromRules = registerForRulesEvents(callbackFunction);
    return () => unsubscribeFromRules();
  }, []);

  return (
    <div className="Firestore-Evaluations-Table">
      <table>
        <thead>
          <tr>
            <th></th>
            <th className="Firestore-Evaluations-Table-Method-Header">
              Method
            </th>
            <th className="Firestore-Evaluations-Table-Path-Header">Path</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {evaluations.map(
            (evaluation: FirestoreRulesEvaluation, index: number) => {
              const { rulesContext, outcome, requestId } = evaluation;
              // time * 1000 converts timestamp units from seconds to millis
              const requestTimeMoment = moment(
                rulesContext?.request?.time * 1000
              );
              const requestTimeComplete = requestTimeMoment.format(
                'MMMM Do YYYY, h:mm:ss A'
              );
              const requestTimeFromNow = requestTimeMoment.fromNow();
              const requestMethod = rulesContext?.request?.method;
              // replace root path, split every subpath and remove resulting empty elements
              const resourceSubPaths = rulesContext?.request?.path
                ?.replace('/databases/(default)/documents', '')
                ?.split('/')
                ?.filter(i => i);
              const outcomeData: RulesOutcomeData = {
                allow: { theme: 'success', icon: 'check', label: 'ALLOW' },
                deny: { theme: 'warning', icon: 'close', label: 'DENY' },
                error: { theme: 'note', icon: 'error', label: 'ERROR' },
              };
              return (
                <tr key={index}>
                  <CustomThemeProvider use={outcomeData[outcome]?.theme} wrap>
                    <td
                      className="Firestore-Evaluations-Table-Outcome"
                      title={outcomeData[outcome]?.label}
                    >
                      <IconButton
                        icon={outcomeData[outcome]?.icon}
                        tag={Link}
                        to={`/firestore/rules/${requestId}`}
                      />
                    </td>
                  </CustomThemeProvider>
                  <td className="Firestore-Evaluations-Table-Method-Data">
                    {requestMethod}
                  </td>
                  <td className="Firestore-Evaluations-Table-Path-Data">
                    {resourceSubPaths?.map((subpath, index) => (
                      <React.Fragment key={`${subpath}-${index}`}>
                        <span className="Firestore-Evaluations-Table-Path-Slash">
                          {' '}
                          /{' '}
                        </span>
                        <span
                          title="copy subpath"
                          className="Firestore-Evaluations-Table-Path-Subpath"
                          onClick={() => {
                            navigator.clipboard.writeText(subpath);
                          }}
                        >
                          {' '}
                          {subpath}{' '}
                        </span>
                      </React.Fragment>
                    ))}
                  </td>
                  <td
                    className="Firestore-Evaluations-Table-Date-Data"
                    title={requestTimeComplete}
                  >
                    {requestTimeFromNow}
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EvaluationsTable;
