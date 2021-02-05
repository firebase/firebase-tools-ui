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

import { act, fireEvent, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';

import { createFakeFirestoreRequestEvaluation } from '../../../testing/test_utils';
import { getDetailsRequestData } from '../index';
import Header from './index';

describe('RequestDetails Header', () => {
  const SET_SHOW_COPY_NOTIFICATION = jest.fn();

  it('renders header when all optional props are given', () => {
    const FAKE_EVALUATION = createFakeFirestoreRequestEvaluation();
    const {
      requestTimeComplete,
      requestTimeFormatted,
      requestMethod,
      resourcePath,
      outcomeData,
    } = getDetailsRequestData(FAKE_EVALUATION);

    const history = createMemoryHistory({
      initialEntries: [`/firestore/requests/requestId`],
    });
    const { getByTestId } = render(
      <Router history={history}>
        <Header
          requestTimeComplete={requestTimeComplete}
          requestTimeFormatted={requestTimeFormatted}
          requestMethod={requestMethod}
          resourcePath={resourcePath}
          outcomeData={outcomeData}
          setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION}
        />
      </Router>
    );
    expect(getByTestId('request-details-header')).not.toBeNull();
  });

  it('renders header when optional props are not given', () => {
    const history = createMemoryHistory({
      initialEntries: [`/firestore/requests/requestId`],
    });
    const { getByTestId } = render(
      <Router history={history}>
        <Header setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION} />
      </Router>
    );
    expect(getByTestId('request-details-header')).not.toBeNull();
  });

  it('redirects back to requests-table when the return-icon-button is clicked', async () => {
    const history = createMemoryHistory({
      initialEntries: [`/firestore/requests/requestId`],
    });
    const { getByLabelText } = render(
      <Router history={history}>
        <Header setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION} />
      </Router>
    );
    await act(async () => {
      await fireEvent.click(getByLabelText('header-return-button'));
    });
    expect(history.location.pathname).toBe('/firestore/requests');
  });
});
