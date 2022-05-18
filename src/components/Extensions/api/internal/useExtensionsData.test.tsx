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

import { renderHook, waitFor } from '@testing-library/react';
import React, { Suspense } from 'react';

import { delay } from '../../../../test_utils';
import { TestEmulatorConfigProvider } from '../../../common/EmulatorConfigProvider';
import { mockExtensionBackends } from '../../testing/mockExtensionBackend';
import { BACKEND_LIST, CONFIG_WITH_EXTENSION } from '../../testing/utils';
import { useExtensionsData } from './useExtensionsData';

describe('useExtensionsData', () => {
  it('returns the list of extension row extensions', async () => {
    mockExtensionBackends(BACKEND_LIST);
    const wrapper: React.FC<React.PropsWithChildren<unknown>> = ({
      children,
    }) => {
      return (
        <TestEmulatorConfigProvider config={CONFIG_WITH_EXTENSION}>
          <Suspense fallback={null}>{children}</Suspense>
        </TestEmulatorConfigProvider>
      );
    };

    const { result } = renderHook(() => useExtensionsData(), {
      wrapper,
    });

    await waitFor(() => delay(100));

    expect(result.current).toEqual([
      {
        authorName: 'Awesome Inc',
        authorUrl: 'https://google.com/awesome',
        params: [],
        name: 'good-tool',
        displayName: 'Pirojok-the-tool',
        specVersion: 'v1beta',
        env: {
          ALLOWED_EVENT_TYPES: 'google.firebase.v1.custom-event-occurred',
          EVENTARC_CHANNEL:
            'projects/test-project/locations/us-west1/channels/firebase',
        },
        allowedEventTypes: ['google.firebase.v1.custom-event-occurred'],
        eventarcChannel:
          'projects/test-project/locations/us-west1/channels/firebase',
        events: [
          {
            type: 'google.firebase.v1.custom-event-occurred',
            description: 'A custom event occurred',
          },
        ],
        apis: [
          {
            apiName: 'storage-component.googleapis.com',
            reason: 'Needed to use Cloud Storage',
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
        roles: [
          {
            role: 'storage.admin',
            reason:
              'Allows the extension to store resized images in Cloud Storage',
          },
        ],
        readmeContent: '',
        postinstallContent: '### See it in action',
        sourceUrl: '',
        extensionDetailsUrl:
          'https://firebase.google.com/products/extensions/good-tool',
        id: 'pirojok-the-published-extension',
        ref: 'awesome-inc/good-tool@0.0.1',
        iconUri:
          'https://www.gstatic.com/mobilesdk/211001_mobilesdk/google-pay-logo.svg',
        publisherIconUri:
          'https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_128dp.png',
      },
      {
        authorName: 'Awesome Inc',
        authorUrl: 'https://google.com/awesome',
        params: [],
        name: 'good-tool',
        displayName: 'Good Tool',
        specVersion: 'v1beta',
        env: {
          ALLOWED_EVENT_TYPES: 'google.firebase.v1.custom-event-occurred',
          EVENTARC_CHANNEL:
            'projects/test-project/locations/us-west1/channels/firebase',
        },
        allowedEventTypes: ['google.firebase.v1.custom-event-occurred'],
        eventarcChannel:
          'projects/test-project/locations/us-west1/channels/firebase',
        events: [
          {
            type: 'google.firebase.v1.custom-event-occurred',
            description: 'A custom event occurred',
          },
        ],
        apis: [
          {
            apiName: 'storage-component.googleapis.com',
            reason: 'Needed to use Cloud Storage',
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
        roles: [
          {
            role: 'storage.admin',
            reason:
              'Allows the extension to store resized images in Cloud Storage',
          },
        ],
        readmeContent: '',
        postinstallContent: '### See it in action',
        sourceUrl: '',
        extensionDetailsUrl:
          'https://firebase.google.com/products/extensions/good-tool',
        id: 'pirojok-the-local-extension',
      },
    ]);
  });
});
