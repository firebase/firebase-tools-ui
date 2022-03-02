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

import { createContext, useContext } from 'react';

import {
  Extension,
  ExtensionRowSpec,
  ExtensionSpec,
  ExtensionVersion,
} from '../models';

interface CommonExtensionBackend {
  env: Record<string, string>;
  extensionInstanceId: string;
}

interface PublishedExtensionBackend extends CommonExtensionBackend {
  extension: Extension;
  extensionVersion: ExtensionVersion;
}

interface LocalExtensionBackend extends CommonExtensionBackend {
  extensionSpec: ExtensionSpec;
}

export type ExtensionBackend =
  | PublishedExtensionBackend
  | LocalExtensionBackend;

export const ExtensionsContext = createContext<ExtensionBackend[]>([]);
export const ExtensionsSpecContext = createContext<ExtensionRowSpec[]>([]);

export const ExtensionsProvider: React.FC<{
  extensionBackends: ExtensionBackend[];
}> = ({ children, extensionBackends }) => {
  return (
    <ExtensionsContext.Provider value={extensionBackends}>
      {children}
    </ExtensionsContext.Provider>
  );
};

export const ExtensionsSpecProvider: React.FC<{
  extensionRowSpecs: ExtensionRowSpec[];
}> = ({ children, extensionRowSpecs }) => {
  return (
    <ExtensionsSpecContext.Provider value={extensionRowSpecs}>
      {children}
    </ExtensionsSpecContext.Provider>
  );
};

export function useExtensions() {
  return useContext(ExtensionsSpecContext);
}

export function isPublishedExtension(
  backend: ExtensionBackend
): backend is PublishedExtensionBackend {
  return backend.hasOwnProperty('extension');
}

export function isLocalExtension(
  backend: ExtensionBackend
): backend is LocalExtensionBackend {
  return backend.hasOwnProperty('extensionSpec');
}
