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

import { Suspense } from 'react';
import { Link, Redirect, Route, Switch, useParams } from 'react-router-dom';
import useSwr from 'swr';

import { useIsEmulatorDisabled } from '../common/EmulatorConfigProvider';
import { useEmulatorConfig } from '../common/EmulatorConfigProvider';
import { EmulatorDisabled } from '../common/EmulatorDisabled';
import { Spinner } from '../common/Spinner';
import { InstanceIdProvider } from './api/useExtension';
import { ExtensionBackend, ExtensionsProvider } from './api/useExtensions';
import { ExtensionDetails } from './Details';
import { ExtensionsList } from './List';
import { Extension, ExtensionSpec, ExtensionVersion } from './models';

export const ExtensionsRoute: React.FC = () => {
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
  extension?: Extension;
  extensionVersion?: ExtensionVersion;
  extensionSpec?: ExtensionSpec;
}

function useFunctionsEmulator() {
  const config = useEmulatorConfig('extensions');
  return `http://${config.hostAndPort}`;
}

function useExtensionBackends(): ExtensionBackend[] {
  const functionsEmulator = useFunctionsEmulator();

  const fetcher = async () => {
    const response = await fetch(`${functionsEmulator}/backends`);
    const json = await response.json();
    return json.backends;
  };

  const backends = useSwr(`list_backends`, fetcher, { suspense: true }).data;
  return backends.filter(isExtensionBackend);
}

function isExtensionBackend(backend: Backend): backend is ExtensionBackend {
  return (
    !!backend.extensionInstanceId &&
    ((!!backend.extension && !!backend.extensionVersion) ||
      !!backend.extensionSpec)
  );
}

const HydrateExtensions: React.FC = ({ children }) => {
  const backends = useExtensionBackends();

  return (
    <ExtensionsProvider extensionBackends={backends}>
      {children}
    </ExtensionsProvider>
  );
};

const Routes: React.FC = () => {
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

const ScopedExtensionDetails: React.FC = () => {
  const instanceId = useParams<{ instanceId: string }>().instanceId;

  return (
    <InstanceIdProvider instanceId={instanceId}>
      <ExtensionDetails />
    </InstanceIdProvider>
  );
};

const ExtensionsRouteSuspended: React.FC = () => {
  const isDisabled = useIsEmulatorDisabled('extensions');
  return isDisabled ? (
    <EmulatorDisabled productName="Extensions" />
  ) : (
    <Spinner span={12} message="Extensions Emulator Loading..." />
  );
};

export const ExtensionLink: React.FC<{ instanceId: string }> = ({
  children,
  instanceId,
}) => <Link to={`/extensions/${instanceId}`}>{children}</Link>;

export const RedirectToList: React.FC = () => <Redirect to="/extensions" />;
