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
import { EmulatorOutdated } from '../../common/EmulatorDisabled';
import CopyPathNotification from './CopyPathNotification';
import { useIsFirestoreRequestsAvailable } from './FirestoreRequestsProvider';
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
  const isRequestsAvailable = useIsFirestoreRequestsAvailable();
  if (!isRequestsAvailable) {
    return <EmulatorOutdated productName="Firestore" />;
  }

  return (
    <>
      <ThemeProvider
        options={{
          surface: grey100,
        }}
        style={{ flex: 1 }}
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
    </>
  );
};

export default Requests;
