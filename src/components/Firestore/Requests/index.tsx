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

import { ThemeProvider } from '@rmwc/theme';
import React, { useEffect } from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import { grey100 } from '../../../colors';
import { addRequestEvaluation } from '../../../store/firestoreRules';
import { noteTheme } from '../../../themes';
import { FirestoreRulesEvaluation } from './rules_evaluation_result_model';
import { registerForRulesEvents } from './rules_evaluations_listener';

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

export interface PropsFromDispatch {
  addEvaluation: typeof addRequestEvaluation;
}

export type Props = PropsFromDispatch;

const Rules: React.FC<Props> = ({ addEvaluation }) => {
  useEffect(() => {
    const callbackFunction = (newEvaluation: FirestoreRulesEvaluation) => {
      const { type } = newEvaluation;
      if (type === 'RULES_UPDATE') {
        // TODO: UPDATE RULES
      } else {
        addEvaluation(newEvaluation);
      }
    };
    const unsubscribeFromRules = registerForRulesEvents(callbackFunction);
    return () => unsubscribeFromRules();
  }, [addEvaluation]);

  return (
    <Switch>
      <Route exact path="/firestore/rules">
        <RulesComponentWrapper>
          {/* NOTE: This will be an import to the actual Component on the next PR */}
          <div> Evaluations Table </div>
        </RulesComponentWrapper>
      </Route>
      <Route exact path="/firestore/rules/:evaluationId">
        <RulesComponentWrapper>
          {/* NOTE: This will be an import to the actual Component on the next PR */}
          <div> Evaluation Details </div>
        </RulesComponentWrapper>
      </Route>
      <Redirect to="/firestore/rules" />
    </Switch>
  );
};

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = dispatch => ({
  addEvaluation: (newEvaluation: FirestoreRulesEvaluation) =>
    dispatch(addRequestEvaluation(newEvaluation)),
});

export default connect(null, mapDispatchToProps)(Rules);
