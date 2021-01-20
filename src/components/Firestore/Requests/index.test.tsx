/**
 * Copyright 2021 Google LLC
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

import {
  createFakeFirestoreRequestEvaluation,
  getMockFirestoreStore,
} from '../testing/test_utils';
import FirestoreRequests from '.';

const FAKE_EVALUATION_ID = 'first-fake-evaluation';
const FAKE_EVALUATION = createFakeFirestoreRequestEvaluation({
  requestId: FAKE_EVALUATION_ID,
});

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
    // Make sure an evaluation with such ID exists on the store,
    // otherwise you would be redirected back to the requests table
    const store = getMockFirestoreStore({
      firestore: {
        requests: {
          evaluations: [FAKE_EVALUATION],
        },
      },
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[`/firestore/requests/${FAKE_EVALUATION_ID}`]}
        >
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
          initialEntries={[`/firestore/requests/${FAKE_EVALUATION_ID}/foo`]}
        >
          <FirestoreRequests />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('requests-card')).not.toBeNull();
  });
});
