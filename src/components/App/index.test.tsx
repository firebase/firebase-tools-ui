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

import { render, wait } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import configureStore from '../../configureStore';
import { alert } from '../common/DialogQueue';
import App from '.';

it('renders without crashing', async () => {
  const div = document.createElement('div');
  const store = configureStore();
  ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>,
    div
  );

  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait(); // these are due to TabScroller/TabIndicator

  ReactDOM.unmountComponentAtNode(div);
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

  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();

  act(() => {
    alert({ title: 'wowah' });
  });

  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait();
  await wait(); // just, sorry. TabScroller/TabIndicator animations

  expect(getByText('wowah')).not.toBeNull();
});
