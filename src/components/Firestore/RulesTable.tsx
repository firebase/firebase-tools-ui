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

import './RulesTable.scss';

import { ThemeProvider } from '@rmwc/theme';
import React, { useEffect, useState } from 'react';

import { grey100 } from '../../colors';
import { CustomThemeProvider, CustomThemeType } from '../../themes';
import { FirestoreRulesEvaluation } from './rules/rules_evaluation_result_model';
import { registerForRulesEvents } from './rules/rules_evaluations_listener';

interface RulesOutcomeData {
  [outcome: string]: {
    theme: CustomThemeType;
    label: string;
  };
}

export const RulesTable: React.FC<{}> = () => {
  const [evaluations, setEvaluations] = useState<FirestoreRulesEvaluation[]>(
    []
  );

  useEffect(() => {
    const callbackFunction = (newEvaluation: FirestoreRulesEvaluation) =>
      setEvaluations(evaluations => [...evaluations, newEvaluation]);
    const unsubscribeFromRules = registerForRulesEvents(callbackFunction);
    return () => unsubscribeFromRules();
  }, []);

  return (
    <ThemeProvider
      options={{
        surface: grey100,
      }}
    >
      <div className="Firestore-RulesTable">
        <table className="Firestore-rules-table">
          <thead>
            <tr>
              <th>Resource name</th>
              <th>Outcome</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map(
              (evaluation: FirestoreRulesEvaluation, index: number) => {
                const { rulesContext, outcome } = evaluation;
                const resourcePath = rulesContext?.request?.path;
                const requestTime = (rulesContext?.request?.time).toDateString();
                const outcomeData: RulesOutcomeData = {
                  allow: { theme: 'success', label: 'ALLOW' },
                  deny: { theme: 'warning', label: 'DENY' },
                  error: { theme: 'note', label: 'ERROR' },
                };
                return (
                  <tr key={index}>
                    <td>{resourcePath}</td>
                    <CustomThemeProvider use={outcomeData[outcome]?.theme} wrap>
                      <td className="Firestore-RulesTable-Outcome">
                        {outcomeData[outcome]?.label}
                      </td>
                    </CustomThemeProvider>
                    <td>{requestTime}</td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </ThemeProvider>
  );
};

export default RulesTable;
