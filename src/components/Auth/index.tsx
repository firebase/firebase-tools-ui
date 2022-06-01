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

import './index.module.scss';

import { Elevation } from '@rmwc/elevation';
import { GridCell, GridRow } from '@rmwc/grid';
import React, { Suspense, useEffect } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { updateAuthConfig } from '../../store/auth/actions';
import { AuthConfig } from '../../store/config/types';
import {
  useConfig,
  useEmulatorConfig,
  useIsEmulatorDisabled,
} from '../common/EmulatorConfigProvider';
import { EmulatorDisabled } from '../common/EmulatorDisabled';
import { Spinner } from '../common/Spinner';
import styles from './index.module.scss';
import OneAccountPerEmailCard from './OneAccountPerEmailCard/OneAccountPerEmailCard';
import ClearAll from './UsersCard/ClearAll';
import TenantPicker, { useTenantFromUrl } from './UsersCard/TenantPicker';
import UsersCard from './UsersCard/UsersCard';

export const authPath = '/auth/';

export const AuthRoute: React.FC<React.PropsWithChildren<unknown>> = () => {
  return (
    <Suspense fallback={<AuthRouteSuspended />}>
      <Switch>
        <Route path={authPath + `:tenantId*`}>
          <AuthWrapper />
        </Route>
      </Switch>
    </Suspense>
  );
};

export default AuthRoute;

export interface AuthProps {
  updateAuthConfig(config: {
    auth: AuthConfig;
    projectId: string;
    tenantId: string;
  }): void;
}

export const Auth: React.FC<React.PropsWithChildren<AuthProps>> = ({
  updateAuthConfig,
}) => {
  const auth = useEmulatorConfig('auth');
  const { projectId } = useConfig();

  const [tenantId] = useTenantFromUrl();

  useEffect(() => {
    updateAuthConfig({ auth, projectId, tenantId });
  }, [auth, projectId, updateAuthConfig, tenantId]);

  return (
    <GridCell span={12} className="Auth">
      <GridRow className={styles.topActions}>
        <GridCell span={2}>
          <TenantPicker />
        </GridCell>
        <GridCell span={8} />
        <GridCell span={2}>
          <ClearAll />
        </GridCell>
      </GridRow>

      <Elevation z="2" wrap>
        <UsersCard />
      </Elevation>
      <Elevation z="2" wrap>
        <OneAccountPerEmailCard />
      </Elevation>
    </GridCell>
  );
};

export const AuthWrapper = connect(null, { updateAuthConfig })(Auth);

export const AuthRouteDisabled: React.FC<
  React.PropsWithChildren<unknown>
> = () => <EmulatorDisabled productName="Auth" />;

const AuthRouteSuspended: React.FC<React.PropsWithChildren<unknown>> = () => {
  const isDisabled = useIsEmulatorDisabled('auth');
  return isDisabled ? (
    <EmulatorDisabled productName="Auth" />
  ) : (
    <Spinner span={12} message="Auth Emulator Loading..." />
  );
};
