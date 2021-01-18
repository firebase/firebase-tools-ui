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

import { ThemeProvider } from '@rmwc/theme';
import React from 'react';

import { errorTheme, successTheme } from '../../../../themes';
import { OutcomeInfo } from '../rules_evaluation_result_model';

interface Props {
  firestoreRules?: string;
  linesOutcome?: OutcomeInfo[];
}

const CodeViewer: React.FC<Props> = ({ firestoreRules, linesOutcome }) => (
  <ThemeProvider
    options={{
      successThemePrimary: successTheme.primary,
      successThemeBackground: successTheme.background,
      errorThemePrimary: errorTheme.primary,
      errorThemeBackground: errorTheme.background,
    }}
  >
    <div
      data-testid="request-details-code-viewer"
      className="Firestore-Request-Details-Code"
    >
      Code Viewer
    </div>
  </ThemeProvider>
);

export default CodeViewer;
