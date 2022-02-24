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

import useSwr from 'swr';

import { useEmulatorConfig } from '../common/EmulatorConfigProvider';
import { Extension, ExtensionSpec, ExtensionVersion } from './models';

export interface Backend {
  env: Record<string, string>;
  extensionInstanceId?: string;
  extension?: Extension;
  extensionVersion?: ExtensionVersion;
  extensionSpec?: ExtensionSpec;
}

interface PublishedExtensionBackend {
  extension: Extension;
  extensionVersion: ExtensionVersion;
}

interface LocalExtensionBackend {
  extensionSpec: ExtensionSpec;
}

export type ExtensionBackend = {
  env: Record<string, string>;
  extensionInstanceId: string;
} & (PublishedExtensionBackend | LocalExtensionBackend);

function useFunctionsEmulator() {
  const config = useEmulatorConfig('functions');
  return `http://${config.hostAndPort}`;
}

function useBackends(): Backend[] {
  const functionsEmulator = useFunctionsEmulator();

  const fetcher = async () => {
    const response = await fetch(`${functionsEmulator}/backends`);
    const json = await response.json();
    return json.backends;
  };

  const backends = useSwr(`list_backends`, fetcher, { suspense: true }).data;
  return backends;
}

function isExtensionBackend(backend: Backend): backend is ExtensionBackend {
  return (
    !!backend.extensionInstanceId &&
    ((!!backend.extension && !!backend.extensionVersion) ||
      !!backend.extensionSpec)
  );
}

export function useExtensionBackends(): ExtensionBackend[] {
  const backends = useBackends();
  return backends.filter(isExtensionBackend);
}
