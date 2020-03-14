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

import React, { useEffect } from 'react';
import { connect, MapDispatchToPropsFunction } from 'react-redux';
import {
  Switch,
  Route,
  useRouteMatch,
  Redirect,
  NavLink,
  Link,
} from 'react-router-dom';
import { Elevation } from '@rmwc/elevation';

import { AppState } from '../../store';
import Database from './Database';
import DatabasePicker from './DatabasePicker';
import { databasesFetchRequest } from '../../store/database';
import { GridCell } from '@rmwc/grid';
import { Card } from '@rmwc/card';
import { CardActionBar } from '../common/CardActionBar';
import { IconButton } from '@rmwc/icon-button';

export interface PropsFromState {
  projectId?: string;
}

export interface PropsFromDispatch {
  fetchDatabases: () => void;
}

export type Props = PropsFromState & PropsFromDispatch;

export const DatabaseDefaultRoute: React.FC<Props> = ({
  projectId,
  fetchDatabases,
}) => {
  let { path, url } = useRouteMatch()!;
  useEffect(() => {
    if (!projectId) return;
    fetchDatabases();
  }, [fetchDatabases, projectId]);

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
            <GridCell span={12} className="Database">
              <Elevation z={2} wrap>
                <Card>
                  <CardActionBar>
                    <IconButton
                      icon="home"
                      tag={props => <Link to="/database" {...props} />}
                    />
                  </CardActionBar>
                  <DatabasePicker
                    current={current}
                    primary={primary}
                    navigation={db => (
                      <NavLink to={`${url}/${db}/data`}>{db}</NavLink>
                    )}
                  />
                  <Database namespace={current} />
                </Card>
              </Elevation>
            </GridCell>
          );
        }}
      ></Route>
    </Switch>
  );
};

export const mapStateToProps = ({ config }: AppState) => ({
  projectId: config.config ? config.config.projectId : undefined,
});

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = dispatch => ({
  fetchDatabases: () => dispatch(databasesFetchRequest()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatabaseDefaultRoute);
