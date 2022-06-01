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
    const postInstallContent = 'CONTENT';
    const eventarcChannel = 'projects/test-project/locations/us-central1/channels/firebase';
    const allowedEventTypes = ['google.firebase.v1.custom-event-occurred'];
    const extension: Extension = {
      id,
      displayName,
      postinstallContent: postInstallContent,
      eventarcChannel,
      allowedEventTypes,
    } as Extension;

    const { queryByTestId, getByText } = render(
      <TestExtensionsProvider extensions={[extension]} instanceId={id}>
        <EventsConfig />
      </TestExtensionsProvider>
    );
    expect(queryByTestId('allowed-event-types-config')).not.toBeNull();
    expect(queryByTestId('channel-location-config')).not.toBeNull();
    expect(getByText(/Events will be emitted via Eventarc/)).not.toBeNull();
  });

  it('Does not render channel or location configs if events are not provided', () => {
    const displayName = 'Pirojok-the-extension';
    const id = 'pirojok';
    const postInstallContent = 'CONTENT';
    const extension: Extension = {
      id,
      displayName,
      postinstallContent: postInstallContent,
    } as Extension;

    const { queryByTestId } = render(
      <TestExtensionsProvider extensions={[extension]} instanceId={id}>
        <EventsConfig />
      </TestExtensionsProvider>
    );
    expect(queryByTestId('allowed-event-types-config')).toBeNull();
    expect(queryByTestId('channel-location-config')).toBeNull();
  });
});

