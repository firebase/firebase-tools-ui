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

import './index.scss';

import { GridCell } from '@rmwc/grid';
import React, { Suspense } from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';

import {
  useConfig,
  useEmulatorConfig,
  useIsEmulatorDisabled,
} from '../common/EmulatorConfigProvider';
import { EmulatorDisabled } from '../common/EmulatorDisabled';
import { Spinner } from '../common/Spinner';
import Database from './Database';
import DatabaseContainer from './DatabaseContainer';
import { DatabaseEmulatedApiProvider } from './DatabaseEmulatedApiProvider';

export const DatabaseRoute: React.FC<React.PropsWithChildren<unknown>> = () => {
  return (
    <Suspense fallback={<DatabaseRouteSuspended />}>
      <DatabaseRouteContent />
    </Suspense>
  );
};

export default DatabaseRoute;

export const DatabaseRouteContent: React.FC<
  React.PropsWithChildren<unknown>
> = () => {
  const config = useEmulatorConfig('database');
  const primary = useConfig().projectId;
  let { path, url } = useRouteMatch()!;

  return (
    <Switch>
      <Route exact path={path}>
        <Redirect to={`${url}/${primary}/data`} />;
      </Route>
      <Route
        path={`${path}/:namespace/data/:path*`}
        render={({ match }: any) => {
          const dbPath = `/${match.params.path || ''}`;
          return (
            <GridCell span={12} className="Page title">
              <h1>Database Emulator</h1>
              <br />
              <DatabaseEmulatedApiProvider namespace={match.params.namespace}>
                <DatabaseContainer
                  primary={primary}
                  navigation={(db) => `${url}/${db}/data`}
                >
                  <Database path={dbPath} config={config} />
                </DatabaseContainer>
              </DatabaseEmulatedApiProvider>

            </GridCell>
          );
        }}
      />
    </Switch>
  );
};

const DatabaseRouteSuspended: React.FC<
  React.PropsWithChildren<unknown>
> = () => {
  const isDisabled = useIsEmulatorDisabled('database');
  return isDisabled ? (
    <EmulatorDisabled productName="Realtime Database" />
  ) : (
    <Spinner span={12} message="Realtime Database Emulator Loading..." />
  );
};
