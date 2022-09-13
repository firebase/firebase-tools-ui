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
import React from 'react';
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

// TODO: is this test really necessary? the following test covers the "crashing"-aspect
it('renders without crashing', async () => {
  expect(async () => {
    render(
      <TestEmulatorConfigProvider config={{ projectId: 'example' }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TestEmulatorConfigProvider>
    );
  }).not.toThrow();
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
