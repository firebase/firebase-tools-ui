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

import { fireEvent, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { BrowserRouter } from 'react-router-dom';

import {
  delay,
  waitAlertDialogToClose,
  waitAlertDialogToOpen,
} from '../../test_utils';
import { alert } from '../common/DialogQueue';
import { TestEmulatorConfigProvider } from '../common/EmulatorConfigProvider';
import App from '.';

it('renders without crashing', async () => {
  const div = document.createElement('div');
  await act(async () => {
    ReactDOM.render(
      <TestEmulatorConfigProvider config={{ projectId: 'example' }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TestEmulatorConfigProvider>,
      div
    );
    // Wait for async tab indicator changes.
    await delay(100);
    expect(div.firstChild).not.toBeNull();
    ReactDOM.unmountComponentAtNode(div);
  });
});

it('shows dialogs in the queue', async () => {
  const { getByText } = render(
    <TestEmulatorConfigProvider config={{ projectId: 'example' }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TestEmulatorConfigProvider>
  );

  await act(() => delay(100)); // Wait for tab indicator async DOM updates.

  act(() => {
    alert({ title: 'wowah' });
  });

  await waitAlertDialogToOpen();

  expect(getByText('wowah')).not.toBeNull();

  await act(async () => {
    fireEvent.click(getByText('OK'));
  });

  await waitAlertDialogToClose();
});
