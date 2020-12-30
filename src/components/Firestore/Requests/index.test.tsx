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
import { createMemoryHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

import { delay } from '../../../test_utils';
import FirestoreRequests from '.';

describe('Firestore Requests', () => {
  it('renders requests table when /firestore/requests', async () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/firestore/requests']}>
        <FirestoreRequests />
      </MemoryRouter>
    );

    // await waitForElement(() => getByTestId('requests-card'));

    expect(getByTestId('requests-card')).not.toBeNull();
  });

  it('renders request details view when /firestore/requests/:requestId', async () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/firestore/requests/uniqueRequestId']}>
        <FirestoreRequests />
      </MemoryRouter>
    );

    // await waitForElement(() => getByTestId('request-details'));

    expect(getByTestId('request-details')).not.toBeNull();
  });

  // it('redirects to /firestore/requests for any other /firestore/requests/:requestId/... path', async () => {
  //   const history = createMemoryHistory({
  //     initialEntries: ['/firestore/requests/uniqueRequestId/foo'],
  //   });
  //   render(
  //     <BrowserRouter>
  //       <FirestoreRequests />
  //     </BrowserRouter>
  //   );

  //   await act(() => delay(100)); // Wait for tab indicator async DOM updates.

  //   expect(history.location.pathname).toBe('/firestore/requests');
  // });
});
