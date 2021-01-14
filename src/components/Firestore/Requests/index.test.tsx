/**
 * Copyright 2020 Google LLC
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
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { getMockFirestoreStore } from '../testing/test_utils';
import FirestoreRequests from '.';

describe('Firestore Requests', () => {
  it('renders requests table when /firestore/requests', async () => {
    const store = getMockFirestoreStore();
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/firestore/requests']}>
          <FirestoreRequests />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('requests-card')).not.toBeNull();
  });

  it('renders request details view when /firestore/requests/:requestId', async () => {
    const store = getMockFirestoreStore();
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/firestore/requests/uniqueRequestId']}>
          <FirestoreRequests />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('request-details')).not.toBeNull();
  });

  it('redirects to /firestore/requests for any other /firestore/requests/:requestId/... path', async () => {
    const store = getMockFirestoreStore();
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={['/firestore/requests/uniqueRequestId/foo']}
        >
          <FirestoreRequests />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('requests-card')).not.toBeNull();
  });
});
