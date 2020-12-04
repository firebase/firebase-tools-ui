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
import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { grey100 } from '../../../colors';
import { noteTheme } from '../../../themes';
import EvaluationDetails from './EvaluationDetails';
import EvaluationsTable from './EvaluationsTable';

const RulesComponentWrapper: React.FC = ({ children }) => (
  <ThemeProvider
    options={{
      surface: grey100,
      hover: noteTheme.background,
    }}
  >
    {children}
  </ThemeProvider>
);

const Rules: React.FC<{}> = () => (
  <Switch>
    <Route exact path="/firestore/rules">
      <RulesComponentWrapper>
        <EvaluationsTable />
      </RulesComponentWrapper>
    </Route>
    <Route exact path="/firestore/rules/:evaluationId">
      <RulesComponentWrapper>
        <EvaluationDetails />
      </RulesComponentWrapper>
    </Route>
  </Switch>
);

export default Rules;
