/**
 * Copyright 2022 Google LLC
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

import React, { Suspense } from 'react';
import { Link, Redirect, Route, Switch, useParams } from 'react-router-dom';

import { useIsEmulatorDisabled } from '../common/EmulatorConfigProvider';
import { ExtensionsEmulatorDisabled } from '../common/EmulatorDisabled';
import { Spinner } from '../common/Spinner';
import { useExtensionsData } from './api/internal/useExtensionsData';
import { InstanceIdProvider } from './api/useExtension';
import { ExtensionsProvider } from './api/useExtensions';
import { ExtensionDetails } from './Details/ExtensionDetails';
import { ExtensionsList } from './List/List';
import { BackendExtension, ExtensionSpec, ExtensionVersion } from './models';

export const ExtensionsRoute: React.FC<
  React.PropsWithChildren<unknown>
> = () => {
  return (
    <Suspense fallback={<ExtensionsRouteSuspended />}>
      <HydrateExtensions>
        <Routes />
      </HydrateExtensions>
    </Suspense>
  );
};

export interface Backend {
  env: Record<string, string>;
  extensionInstanceId?: string;
  extension?: BackendExtension;
  extensionVersion?: ExtensionVersion;
  extensionSpec?: ExtensionSpec;
}

const HydrateExtensions: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const extensions = useExtensionsData();

  return (
    <ExtensionsProvider extensions={extensions}>{children}</ExtensionsProvider>
  );
};

const Routes: React.FC<React.PropsWithChildren<unknown>> = () => {
  return (
    <Switch>
      <Route
        path="/extensions/:instanceId"
        component={ScopedExtensionDetails}
      />
      <Route path="/extensions" component={ExtensionsList} />
    </Switch>
  );
};

const ScopedExtensionDetails: React.FC<
  React.PropsWithChildren<unknown>
> = () => {
  const instanceId = useParams<{ instanceId: string }>().instanceId;

  return (
    <InstanceIdProvider instanceId={instanceId}>
      <ExtensionDetails />
    </InstanceIdProvider>
  );
};

const ExtensionsRouteSuspended: React.FC<
  React.PropsWithChildren<unknown>
> = () => {
  const isDisabled = useIsEmulatorDisabled('extensions');
  return isDisabled ? (
    <ExtensionsEmulatorDisabled/>
  ) : (
    <Spinner span={12} message="Extensions Emulator Loading..." />
  );
};

export const ExtensionLink: React.FC<
  React.PropsWithChildren<{ instanceId: string }>
> = ({ children, instanceId }) => (
  <Link to={`/extensions/${instanceId}`}>{children}</Link>
);

export const RedirectToList: React.FC<
  React.PropsWithChildren<unknown>
> = () => <Redirect to="/extensions" />;
