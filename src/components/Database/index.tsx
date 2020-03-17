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

import React from 'react';
import { connect } from 'react-redux';
import {
  Switch,
  Route,
  useRouteMatch,
  Redirect,
  NavLink,
} from 'react-router-dom';

import { AppState } from '../../store';
import DatabaseContainer from './DatabaseContainer';
import Database from './Database';

export interface PropsFromState {
  projectId?: string;
}

export type Props = PropsFromState;

export const DatabaseDefaultRoute: React.FC<Props> = ({ projectId }) => {
  let { path, url } = useRouteMatch()!;

  if (!projectId) {
    return <div>Loading...</div>;
  }
  const primary = projectId;

  return (
    <Switch>
      <Route exact path={path}>
        <Redirect to={`${url}/${primary}/data`} />;
      </Route>
      <Route
        path={`${path}/:namespace/data`}
        render={({ match }: any) => {
          const current = match.params.namespace;
          return (
            <DatabaseContainer
              primary={primary}
              current={current}
              navigation={db => (
                <NavLink to={`${url}/${db}/data`}>{db}</NavLink>
              )}
            >
              <Database namespace={current} />
            </DatabaseContainer>
          );
        }}
      ></Route>
    </Switch>
  );
};

export const mapStateToProps = ({ config }: AppState): PropsFromState => ({
  projectId: config.config ? config.config.projectId : undefined,
});

export default connect(mapStateToProps)(DatabaseDefaultRoute);
