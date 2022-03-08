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
import { Extension } from '../../models';
import { ExtensionBackend, isLocalExtension } from '../useExtensions';
import { useExtensionBackends } from './useExtensionBackends';

export function useExtensionsData(): Extension[] {
  const backends = useExtensionBackends();

  return convertBackendsToExtensions(backends);
}

export function convertBackendToExtension(backend: ExtensionBackend) {
  if (isLocalExtension(backend)) {
    return {
      id: backend.extensionInstanceId,
      ...backend.extensionSpec,
    };
  }

  return {
    id: backend.extensionInstanceId,
    ...backend.extensionVersion.spec,
    // TODO(kirjs): Use default icon for local extensions
    iconUri: backend.extension.iconUri,
    publisherIconUri: backend.extension.publisher?.iconUri,
  };
}

export function convertBackendsToExtensions(backends: ExtensionBackend[]) {
  return backends.map(convertBackendToExtension);
}
