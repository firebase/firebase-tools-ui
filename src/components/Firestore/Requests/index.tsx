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

import { ThemeProvider } from '@rmwc/theme';
import React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';

import {
  grey100,
  textBlackPrimary,
  textBlackSecondary,
  textBlackTernary,
} from '../../../colors';
import RequestDetails, { PropsFromParentComponent } from './RequestDetails';
// import RequestsHeader from './RequestsCard/Header';
import RequestsTable from './RequestsCard/Table';

const Requests: React.FC = () => (
  <ThemeProvider
    options={{
      surface: grey100,
      textBlackPrimary,
      textBlackSecondary,
      textBlackTernary,
    }}
  >
    <Switch>
      <Route exact path="/firestore/requests">
        <div data-testid="requests-card">
          {/* TODO: Finish developing the RequestsHeader in order to render it */}
          {/* <RequestsHeader /> */}
          <RequestsTable />
        </div>
      </Route>
      <Route
        exact
        path="/firestore/requests/:requestId"
        render={({ match }: RouteComponentProps<PropsFromParentComponent>) => {
          const requestId = match.params.requestId;
          return <RequestDetails requestId={requestId} />;
        }}
      />
      <Redirect to="/firestore/requests" />
    </Switch>
  </ThemeProvider>
);

export default Requests;
