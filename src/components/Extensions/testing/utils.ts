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

import { ExtensionBackend } from '../api/useExtensions';
import {
  BackendExtension,
  Extension,
  ExtensionSpec,
  ExtensionVersion,
  RegistryLaunchStage,
  Visibility,
} from '../models';

export const EXTENSION_SPEC: ExtensionSpec = {
  specVersion: 'v1beta',
  name: 'good-tool',
  version: '0.0.1',
  displayName: 'Good Tool',
  description: 'Does something really useful',
  apis: [
    {
      apiName: 'storage-component.googleapis.com',
      reason: 'Needed to use Cloud Storage',
    },
  ],
  roles: [
    {
      role: 'storage.admin',
      reason: 'Allows the extension to store resized images in Cloud Storage',
    },
  ],
  resources: [
    {
      type: 'firebaseextensions.v1beta.function',
      description:
        'Listens for new images uploaded to your specified Cloud Storage bucket, resizes the images, then stores the resized images in the same bucket. Optionally keeps or deletes the original images.',
      name: 'generateResizedImage',
      propertiesYaml:
        'availableMemoryMb: 1024\neventTrigger:\n  eventType: google.storage.object.finalize\n  resource: projects/_/buckets/${param:IMG_BUCKET}\nlocation: ${param:LOCATION}\nruntime: nodejs14\n',
    },
  ],
  billingRequired: true,
  author: {
    authorName: 'Awesome Inc',
    url: 'https://google.com/awesome',
  },
  license: 'MIT',
  releaseNotesUrl: 'https://google.com/awesome/release-notes',
  params: [],
  postinstallContent: '### See it in action',
  externalServices: [
    {
      name: 'blockchain co.',
      pricingUri: 'https://google.com/blockchain',
    },
  ],
};

export const EXTENSION_VERSION: ExtensionVersion = {
  name: 'publishers/awesome-inc/extensions/good-tool/versions/0.0.1',
  ref: 'awesome-inc/good-tool@0.0.1',
  state: 'PUBLISHED',
  spec: { ...EXTENSION_SPEC, displayName: 'Pirojok-the-tool' },
  hash: '12345',
  sourceDownloadUri: 'https://google.com/asdf',
  releaseNotes: 'Hello world! Say hi to a good tool',
  createTime: '2021-10-27T00:00:00.000Z',
};

export const BACKEND_EXTENSION: BackendExtension = {
  name: 'publishers/awesome-inc/extensions/good-tool',
  ref: 'awesome-inc/good-tool',
  visibility: Visibility.PUBLIC,
  registryLaunchStage: RegistryLaunchStage.GA,
  createTime: '2021-10-27T00:00:00.000Z',
  iconUri:
    'https://www.gstatic.com/mobilesdk/211001_mobilesdk/google-pay-logo.svg',
  publisher: {
    displayName: 'Awesome Inc.',
    iconUri:
      'https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_128dp.png',
  },
};

export const CONFIG_WITH_EXTENSION = {
  projectId: '',
  extensions: {
    hostAndPort: 'lol',
    host: 'pirojok',
    port: 689,
  },
};

export const BACKEND_LIST: ExtensionBackend[] = [
  // published extension
  {
    env: {},
    extensionInstanceId: 'pirojok-the-published-extension',
    extension: BACKEND_EXTENSION,
    extensionVersion: EXTENSION_VERSION,
    functionTriggers: [],
  },
  // local extension
  {
    extensionInstanceId: 'pirojok-the-local-extension',
    env: {},
    extensionSpec: EXTENSION_SPEC,
    functionTriggers: [],
  },
  // Not and extension back-end
  {
    env: {},
    extensionSpec: EXTENSION_SPEC,
  } as ExtensionBackend,
];

export const EXTENSION_ID = 'pirojok';

export const EXTENSION: Extension = {
  id: EXTENSION_ID,
  postinstallContent: 'LOL',
  ref: 'pirojok-the-ref',
  displayName: 'Pirojok the extension',
  authorUrl: 'https://author.url',
  authorName: 'Pirojok the author',
  specVersion: '1.0.0',
  readmeContent: '# Readme',
  sourceUrl: 'https://source.url',
  extensionDetailsUrl: 'https://extension.details.url',
  roles: [
    {
      role: 'storage.admin',
      reason: 'Allows the extension to store resized images in Cloud Storage',
    },
  ],
  params: [{ param: 'pirojok', label: 'label', value: 'param=value' }],
  resources: [{ name: 'resource', description: 'description', type: '' }],
  apis: [{ apiName: 'api-name', reason: 'reason' }],
};
