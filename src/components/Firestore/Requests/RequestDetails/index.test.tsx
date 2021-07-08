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
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';

import { createFakeFirestoreRequestEvaluation } from '../../testing/test_utils';
import { RequestDetails } from './index';

const FAKE_EVALUATION_ID = 'first-fake-evaluation';
const FAKE_EVALUATION = createFakeFirestoreRequestEvaluation({
  requestId: FAKE_EVALUATION_ID,
});
const SET_SHOW_COPY_NOTIFICATION = jest.fn();

describe('RequestDetails', () => {
  it('renders header', () => {
    const history = createMemoryHistory({
      initialEntries: [`/firestore/requests/${FAKE_EVALUATION_ID}`],
    });
    const { getByTestId } = render(
      <Router history={history}>
        <RequestDetails
          selectedRequest={FAKE_EVALUATION}
          requestId={FAKE_EVALUATION_ID}
          setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION}
        />
      </Router>
    );
    expect(getByTestId('request-details-header')).not.toBeNull();
  });
  it('renders code viewer section', () => {
    const history = createMemoryHistory({
      initialEntries: [`/firestore/requests/${FAKE_EVALUATION_ID}`],
    });
    const { getByTestId } = render(
      <Router history={history}>
        <RequestDetails
          selectedRequest={FAKE_EVALUATION}
          requestId={FAKE_EVALUATION_ID}
          setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION}
        />
      </Router>
    );
    expect(getByTestId('request-details-code-viewer-section')).not.toBeNull();
  });
  it('renders inspection section', () => {
    const history = createMemoryHistory({
      initialEntries: [`/firestore/requests/${FAKE_EVALUATION_ID}`],
    });
    const { getByTestId } = render(
      <Router history={history}>
        <RequestDetails
          selectedRequest={FAKE_EVALUATION}
          requestId={FAKE_EVALUATION_ID}
          setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION}
        />
      </Router>
    );
    expect(getByTestId('request-details-inspection-section')).not.toBeNull();
  });

  it('redirects back to requests-table when requestId did not match any existing request', async () => {
    const history = createMemoryHistory({
      initialEntries: [`/firestore/requests/${FAKE_EVALUATION_ID}`],
    });
    render(
      <Router history={history}>
        <RequestDetails
          selectedRequest={undefined}
          requestId={FAKE_EVALUATION_ID}
          setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION}
        />
      </Router>
    );
    expect(history.location.pathname).toBe('/firestore/requests');
  });
});
