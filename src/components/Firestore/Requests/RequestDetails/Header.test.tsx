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

import { OutcomeData } from '../types';
import { ICON_SELECTOR } from '../utils';
import Header from './Header';

const MOCKED_OUTCOME_DATA: OutcomeData = {
  theme: 'success',
  icon: ICON_SELECTOR['allow'],
  label: 'ALLOW',
};

describe('RequestDetails Header', () => {
  it('renders header when all optional props are given', () => {
    const history = createMemoryHistory({
      initialEntries: [`/firestore/requests/requestId`],
    });
    const { getByTestId } = render(
      <Router history={history}>
        <Header
          requestTimeComplete=""
          requestTimeFormatted=""
          requestMethod=""
          resourcePath=""
          outcomeData={MOCKED_OUTCOME_DATA}
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
        <Header />
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
        <Header />
      </Router>
    );
    await act(async () => {
      await fireEvent.click(getByLabelText('header-return-button'));
    });
    expect(history.location.pathname).toBe('/firestore/requests');
  });

  it('renders the actions component', () => {
    const history = createMemoryHistory({
      initialEntries: [`/firestore/requests/requestId`],
    });
    const { getByTestId } = render(
      <Router history={history}>
        <Header />
      </Router>
    );
    expect(getByTestId('request-details-header-actions')).not.toBeNull();
  });
});
