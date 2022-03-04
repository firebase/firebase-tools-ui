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

import { renderHook } from '@testing-library/react-hooks';
import React, { Suspense } from 'react';

import { TestEmulatorConfigProvider } from '../../../common/EmulatorConfigProvider';
import { mockExtensionBackends } from '../../testing/mockExtensionBackend';
import { BACKEND_LIST, CONFIG_WITH_EXTENSION } from '../../testing/utils';
import { useExtensionData } from './useExtensionData';

describe('useExtensionDatas', () => {
  it('returns the list of extension row extensions', async () => {
    mockExtensionBackends(BACKEND_LIST);
    const wrapper: React.FC = ({ children }) => {
      return (
        <TestEmulatorConfigProvider config={CONFIG_WITH_EXTENSION}>
          <Suspense fallback={null}>{children}</Suspense>
        </TestEmulatorConfigProvider>
      );
    };

    const { result, waitForNextUpdate } = renderHook(() => useExtensionData(), {
      wrapper,
    });
    await waitForNextUpdate();

    expect(result.current).toEqual([
      {
        id: 'pirojok-the-published-extension',
        specVersion: 'v1beta',
        name: 'good-tool',
        version: '0.0.1',
        displayName: 'Pirojok-the-tool',
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
            reason:
              'Allows the extension to store resized images in Cloud Storage',
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
        iconUri:
          'https://www.gstatic.com/mobilesdk/211001_mobilesdk/google-pay-logo.svg',
        publisherIconUri:
          'https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_128dp.png',
      },
      {
        id: 'pirojok-the-local-extension',
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
            reason:
              'Allows the extension to store resized images in Cloud Storage',
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
      },
    ]);
  });
});
