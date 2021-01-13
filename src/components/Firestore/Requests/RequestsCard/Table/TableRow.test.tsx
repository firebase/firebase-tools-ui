/**
 * Copyright 2019 Google LLC
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

import { fireEvent, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Router } from 'react-router-dom';

import { createFakeFirestoreRequestEvaluation } from '../../../testing/test_utils';
import RequestsTableRow from './TableRow';

const fakeEvaluation1_ID = 'first-fake-evaluation';
const fakeEvaluation1 = createFakeFirestoreRequestEvaluation({
  requestId: fakeEvaluation1_ID,
});

describe('RequestsTableRow', () => {
  it('redirects to corresponding request details path when clicking table row', async () => {
    const history = createMemoryHistory({
      initialEntries: ['/firestore/requests'],
    });
    const { getByRole } = render(
      <Router history={history}>
        <RequestsTableRow
          request={fakeEvaluation1}
          requestId={fakeEvaluation1_ID}
        />
      </Router>
    );
    await act(async () => {
      fireEvent.click(getByRole('row'));
    });
    expect(history.location.pathname).toBe(
      `/firestore/requests/${fakeEvaluation1_ID}`
    );
  });
});
