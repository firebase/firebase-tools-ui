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

import './index.scss';

import { ThemeProvider } from '@rmwc/theme';
import React, { useState } from 'react';

import { grey100 } from '../../../colors';
import { noteTheme } from '../../../themes';
import { FirestoreRulesIssue } from './rules_evaluation_result_model';
import RulesCode, { LineOutcome } from './RulesCode';
import RulesList from './RulesList';
import { sampleRules } from './sample-rules';

export const Rules: React.FC<{}> = () => {
  const [linesOutcome, setLinesOutcome] = useState<LineOutcome[]>([]);
  // const [firestoreRules, setFirestoreRules] = useState<string>("");
  const [firestoreRules, setFirestoreRules] = useState<string>(sampleRules);
  const [rulesIssues, setRulesIssues] = useState<FirestoreRulesIssue[]>([]);

  return (
    <ThemeProvider
      options={{
        surface: grey100,
        hover: noteTheme.background,
      }}
    >
      <div className="Firestore-Rules">
        <RulesList
          setLinesOutcome={setLinesOutcome}
          setFirestoreRules={setFirestoreRules}
          setRulesIssues={setRulesIssues}
        />
        <RulesCode
          linesOutcome={linesOutcome}
          firestoreRules={firestoreRules}
          rulesIssues={rulesIssues}
        />
      </div>
    </ThemeProvider>
  );
};

export default Rules;
