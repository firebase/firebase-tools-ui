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
import React, { useState } from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';

import { grey100 } from '../../../colors';
import { Callout } from '../../common/Callout';
import CopyPathNotification from './CopyPathNotification';
import RequestDetails from './RequestDetails';
// import RequestsHeader from './RequestsCard/Header';
import RequestsTable from './RequestsCard/Table';

export interface RequestDetailsRouteParams {
  requestId: string;
}

const Requests: React.FC = () => {
  const [showCopyNotification, setShowCopyNotification] = useState<boolean>(
    false
  );

  return (
    <>
      <ThemeProvider
        options={{
          surface: grey100,
        }}
      >
        <Switch>
          <Route exact path="/firestore/requests">
            <div data-testid="requests-card">
              {/* TODO: Finish developing the RequestsHeader in order to render it */}
              {/* <RequestsHeader /> */}
              <RequestsTable
                setShowCopyNotification={setShowCopyNotification}
              />
            </div>
          </Route>
          <Route
            exact
            path="/firestore/requests/:requestId"
            render={({
              match,
            }: RouteComponentProps<RequestDetailsRouteParams>) => {
              const requestId = match.params.requestId;
              return (
                <RequestDetails
                  requestId={requestId}
                  setShowCopyNotification={setShowCopyNotification}
                />
              );
            }}
          />
          <Redirect to="/firestore/requests" />
        </Switch>
        <CopyPathNotification
          showCopyNotification={showCopyNotification}
          setShowCopyNotification={setShowCopyNotification}
        />
      </ThemeProvider>
      {/* Show banner only on the table view, but as an immediate child of the Card for layout reasons. */}
      <Route exact path="/firestore/requests">
        <Callout type="note">
          Only client requests are shown above.{' '}
          <a href="https://firebase.google.com/docs/admin/setup">Admin SDK</a>{' '}
          requests and{' '}
          <a href="https://firebase.google.com/docs/firestore/security/rules-conditions#access_other_documents">
            access calls initiated by Security Rules
          </a>{' '}
          are not listed because they bypass Security Rules.
        </Callout>
      </Route>
    </>
  );
};

export default Requests;
