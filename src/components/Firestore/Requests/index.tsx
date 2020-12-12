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
import { addRequestEvaluation } from '../../../store/firestoreRequestEvaluations';
import { noteTheme } from '../../../themes';
import { FirestoreRulesEvaluation } from './rules_evaluation_result_model';
import { registerForRulesEvents } from './rules_evaluations_listener';

export interface PropsFromDispatch {
  addRequest: typeof addRequestEvaluation;
}

export type Props = PropsFromDispatch;

const Requests: React.FC<Props> = ({ addRequest }) => {
  useEffect(() => {
    const callbackFunction = (newEvaluation: FirestoreRulesEvaluation) => {
      const { type } = newEvaluation;
      if (type === 'RULES_UPDATE') {
        // TODO: UPDATE RULES
      } else {
        addRequest(newEvaluation);
      }
    };
    const unsubscribeFromRules = registerForRulesEvents(callbackFunction);
    return () => unsubscribeFromRules();
  }, [addRequest]);

  return (
    <ThemeProvider
      options={{
        surface: grey100,
        hover: noteTheme.background,
      }}
    >
      <Switch>
        <Route exact path="/firestore/requests">
          {/* NOTE: This will be an import to the actual Component on the next PR */}
          <div> Requests Table </div>
        </Route>
        <Route exact path="/firestore/requests/:requestId">
          {/* NOTE: This will be an import to the actual Component on the next PR */}
          <div> Request Details </div>
        </Route>
        <Redirect to="/firestore/requests" />
      </Switch>
    </ThemeProvider>
  );
};

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = dispatch => ({
  addRequest: (newEvaluation: FirestoreRulesEvaluation) =>
    dispatch(addRequestEvaluation(newEvaluation)),
});

export default connect(null, mapDispatchToProps)(Requests);
