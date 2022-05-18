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
import { Extension, ExtensionResource, Resource } from '../../models';
import { ExtensionBackend, isLocalExtension } from '../useExtensions';
import { useExtensionBackends } from './useExtensionBackends';

const EXTENSION_DETAILS_URL_BASE =
  'https://firebase.google.com/products/extensions/';

export function useExtensionsData(): Extension[] {
  const backends = useExtensionBackends();

  return convertBackendsToExtensions(backends);
}

export function convertBackendToExtension(
  backend: ExtensionBackend
): Extension {
  const spec = isLocalExtension(backend)
    ? backend.extensionSpec
    : backend.extensionVersion.spec;

  const importResources = (r: Resource): ExtensionResource => {
    const trigger = (backend.functionTriggers ?? []).find(
      (t) => t.entryPoint === r.name
    );

    return trigger
      ? {
          ...r,
          functionName: trigger.regions[0] + '-' + trigger.name,
        }
      : r;
  };

  const shared = {
    authorUrl: spec.author?.url ?? '',
    params: spec.params.map((p) => {
      return {
        ...p,
        value: backend.env[p.param],
      };
    }),
    name: spec.name,
    displayName: spec.displayName ?? '',
    specVersion: spec.specVersion ?? '',
    env: backend.env,
    allowedEventTypes: backend.env.ALLOWED_EVENT_TYPES,
    eventarcChannel: backend.env.EVENTARC_CHANNEL,
    events: spec.events ?? [],
    apis: spec.apis ?? [],
    resources: (spec.resources ?? []).map(importResources),
    roles: spec.roles ?? [],
    readmeContent: spec.readmeContent ?? '',
    postinstallContent: spec.postinstallContent ?? '',
    sourceUrl: spec.sourceUrl ?? '',
    extensionDetailsUrl: EXTENSION_DETAILS_URL_BASE + spec.name,
  };

  if (isLocalExtension(backend)) {
    return {
      ...shared,
      authorName: spec.author?.authorName ?? '',
      id: backend.extensionInstanceId,
    };
  }

  return {
    ...shared,
    id: backend.extensionInstanceId,
    ref: backend.extensionVersion.ref,
    authorName:
      spec.author?.authorName ??
      backend.extensionVersion.ref.match(/^[^/]+/)?.[0] ??
      '',
    iconUri:
      backend.extension.iconUri ?? '/assets/extensions/default-extension.png',
    publisherIconUri: backend.extension.publisher?.iconUri,
  };
}

export function convertBackendsToExtensions(backends: ExtensionBackend[]) {
  return backends.map(convertBackendToExtension);
}
