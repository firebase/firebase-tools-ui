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

import { CircularProgress } from '@rmwc/circular-progress';
import { GridCell } from '@rmwc/grid';
import { Typography } from '@rmwc/typography';
import React from 'react';
import { connect } from 'react-redux';
import {
  NavLink,
  Redirect,
  Route,
  Switch,
  useRouteMatch,
} from 'react-router-dom';

import { createStructuredSelector } from '../../store';
import { DatabaseConfig } from '../../store/config';
import {
  getDatabaseConfigResult,
  getProjectIdResult,
} from '../../store/config/selectors';
import { combineData, handle } from '../../store/utils';
import { EmulatorDisabled } from '../common/EmulatorDisabled';
import Database from './Database';
import DatabaseContainer from './DatabaseContainer';

export const mapStateToProps = createStructuredSelector({
  projectIdResult: getProjectIdResult,
  configResult: getDatabaseConfigResult,
});

export type PropsFromState = ReturnType<typeof mapStateToProps>;

export const DatabaseRoute: React.FC<PropsFromState> = ({
  projectIdResult,
  configResult,
}) => {
  return handle(combineData(projectIdResult, configResult), {
    onNone: () => <DatabaseRouteLoading />,
    onError: () => <DatabaseRouteDisabled />,
    onData: ([projectId, config]) =>
      config === undefined ? (
        <DatabaseRouteDisabled />
      ) : (
        <DatabaseRouteContent projectId={projectId} config={config} />
      ),
  });
};

export default connect(mapStateToProps)(DatabaseRoute);

// Components for different loading cases:

export type ContentProps = {
  projectId: string;
  config: DatabaseConfig;
};

export const DatabaseRouteContent: React.FC<ContentProps> = ({
  projectId,
  config,
}) => {
  let { path, url } = useRouteMatch()!;
  const primary = projectId;

  return (
    <Switch>
      <Route exact path={path}>
        <Redirect to={`${url}/${primary}/data`} />;
      </Route>
      <Route
        path={`${path}/:namespace/data/:path*`}
        render={({ match }: any) => {
          const current = match.params.namespace;
          const dbPath = `/${match.params.path || ''}`;
          return (
            <DatabaseContainer
              primary={primary}
              current={current}
              navigation={db => (
                <NavLink to={`${url}/${db}/data`}>{db}</NavLink>
              )}
            >
              <Database namespace={current} path={dbPath} config={config} />
            </DatabaseContainer>
          );
        }}
      ></Route>
    </Switch>
  );
};

export const DatabaseRouteLoading: React.FC = () => (
  <GridCell span={12} align="middle" className="Database-loading">
    <CircularProgress size="xlarge" />
    <Typography use="body2" tag="p">
      RTDB Emulator Loading...
    </Typography>
  </GridCell>
);

export const DatabaseRouteDisabled: React.FC = () => (
  <EmulatorDisabled productName="RTDB" />
);
