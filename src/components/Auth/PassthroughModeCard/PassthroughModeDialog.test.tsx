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

import { Portal } from '@rmwc/base';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { AppState } from '../../../store';
import { getMockAuthStore } from '../test_utils';
import { UsageMode } from '../types';
import { PassthroughModeDialog } from './PassthroughModeDialog';

describe('PassthroughModeDialog', () => {
  function setup(usageMode: UsageMode = UsageMode.DEFAULT) {
    const onClose = jest.fn();
    const setUsageMode = jest.fn();
    const store = getMockAuthStore({ usageMode });

    const methods = render(
      <Provider store={store}>
        <Portal />
        <PassthroughModeDialog
          usageMode={usageMode ?? UsageMode.DEFAULT}
          onClose={onClose}
          setUsageMode={setUsageMode}
        />
      </Provider>
    );

    return {
      onClose,
      setUsageMode,
      ...methods,
    };
  }

  it('calls onClose on hitting "Enable passthrough" button', async () => {
    const { getByText, onClose } = setup();
    fireEvent.submit(getByText('Enable passthrough'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls setUsageMode with the correct argument after hitting the "Enable passthrough" button', async () => {
    const { getByText, setUsageMode } = setup();
    fireEvent.submit(getByText('Enable passthrough'));
    expect(setUsageMode).toHaveBeenCalledWith(UsageMode.PASSTHROUGH);
  });

  it('calls setUsageMode with the correct argument after hitting the "Disable passthrough" button', async () => {
    const { getByText, setUsageMode } = setup(UsageMode.PASSTHROUGH);
    fireEvent.submit(getByText('Disable passthrough'));
    expect(setUsageMode).toHaveBeenCalledWith(UsageMode.DEFAULT);
  });

  it('calls onClose on hitting "cancel" button', async () => {
    const { getByText, onClose } = setup();
    fireEvent.click(getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
