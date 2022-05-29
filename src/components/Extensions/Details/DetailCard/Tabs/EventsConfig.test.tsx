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

import { render } from '@testing-library/react';

import { Extension } from '../../../models';
import { TestExtensionsProvider } from '../../../testing/TestExtensionsProvider';
import { EventsConfig } from './EventsConfig';

describe('EventsConfig', () => {
  it('Renders channel and allowed events config options', () => {
    const displayName = 'Pirojok-the-extension';
    const id = 'pirojok';
    const POST_INSTALL_CONTENT = 'CONTENT';
    const extension: Extension = {
      id,
      displayName,
      postinstallContent: POST_INSTALL_CONTENT,
      eventarcChannel:
        'projects/test-project/locations/us-central1/channels/firebase',
      allowedEventTypes: ['google.firebase.v1.custom-event-occurred'],
    } as Extension;

    const { getByText } = render(
      <TestExtensionsProvider extensions={[extension]} instanceId={id}>
        <EventsConfig />
      </TestExtensionsProvider>
    );
    expect(getByText(/Events will be emitted via Eventarc/)).not.toBeNull();
  });
});
