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

import { createFakeFirestoreRequestEvaluation } from '../../../testing/test_utils';
import { RequestsTable } from './index';
import { NO_RESULTS_MESSAGE } from './NoResults';
import { ZERO_STATE_MESSAGE } from './ZeroState';

const FAKE_EVALUATION_1 = createFakeFirestoreRequestEvaluation({
  requestId: 'first-fake-evaluation',
});
const FAKE_EVALUATION_2 = createFakeFirestoreRequestEvaluation({
  requestId: 'second-fake-evaluation',
});
const SET_SHOW_COPY_NOTIFICATION = jest.fn();

describe('RequestsTable', () => {
  it('renders table header row when there are no requests', () => {
    const { getAllByRole } = render(
      <RequestsTable
        filteredRequests={[]}
        shouldShowZeroResults={false}
        shouldShowZeroState={true}
        shouldShowTable={false}
        setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION}
      />
    );
    // Keeps the header
    expect(getAllByRole('row').length).toBe(1);
  });

  it('renders appropriate number of rows when there are requests', () => {
    const { getAllByRole, queryByText } = render(
      <RequestsTable
        filteredRequests={[FAKE_EVALUATION_1, FAKE_EVALUATION_2]}
        shouldShowZeroResults={false}
        shouldShowZeroState={false}
        shouldShowTable={true}
        setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION}
      />
    );
    // Header + 2 requests
    expect(getAllByRole('row').length).toBe(3);
    expect(queryByText(NO_RESULTS_MESSAGE)).toBeNull();
  });

  it('displays NoResults message', () => {
    const { getAllByRole, getByText } = render(
      <RequestsTable
        filteredRequests={[]}
        shouldShowZeroResults={true}
        shouldShowZeroState={false}
        shouldShowTable={false}
        setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION}
      />
    );
    // Keeps the header
    expect(getAllByRole('row').length).toBe(1);
    getByText(NO_RESULTS_MESSAGE);
  });

  it('displays ZeroState message', () => {
    const { getAllByRole, getByText } = render(
      <RequestsTable
        filteredRequests={[]}
        shouldShowZeroResults={false}
        shouldShowZeroState={true}
        shouldShowTable={false}
        setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION}
      />
    );
    // Keeps the header
    expect(getAllByRole('row').length).toBe(1);
    getByText(ZERO_STATE_MESSAGE);
  });
});
