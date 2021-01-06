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
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { BrowserRouter, Router } from 'react-router-dom';

import configureStore from '../../configureStore';
import { delay, waitForDialogsToOpen } from '../../test_utils';
import { alert } from '../common/DialogQueue';
import App, { REDIRECT_LOGS_URL } from '.';

it('renders without crashing', async () => {
  const div = document.createElement('div');
  const store = configureStore();
  await act(async () => {
    ReactDOM.render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>,
      div
    );
    // Wait for async tab indicator changes.
    await delay(100);
    ReactDOM.unmountComponentAtNode(div);
  });
});

it('shows dialogs in the queue', async () => {
  const store = configureStore();
  const { getByText } = render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );

  await act(() => delay(100)); // Wait for tab indicator async DOM updates.

  act(() => {
    alert({ title: 'wowah' });
  });

  await waitForDialogsToOpen();

  expect(getByText('wowah')).not.toBeNull();
});

it('redirects from url /functions to correct logs url', async () => {
  const store = configureStore();
  const history = createMemoryHistory({
    initialEntries: ['/functions'],
  });
  render(
    <Provider store={store}>
      <Router history={history}>
        <App />
      </Router>
    </Provider>
  );
  await act(() => delay(100)); // Wait for tab indicator async DOM updates.
  const { pathname, search } = history.location;
  const redirectedCompleteUrl = pathname + search;
  expect(redirectedCompleteUrl).toBe(REDIRECT_LOGS_URL);
});

it('redirects from url /firestore to /firestore/data', async () => {
  const store = configureStore();
  const history = createMemoryHistory({
    initialEntries: ['/firestore'],
  });
  render(
    <Provider store={store}>
      <Router history={history}>
        <App />
      </Router>
    </Provider>
  );
  await act(() => delay(100)); // Wait for tab indicator async DOM updates.
  expect(history.location.pathname).toBe('/firestore/data');
});
