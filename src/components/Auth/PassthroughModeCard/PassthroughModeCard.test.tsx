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
import { waitForDialogsToOpen } from '../../../test_utils';
import { getMockAuthStore } from '../test_utils';
import { UsageMode } from '../types';
import {
  DISABLED_COPY,
  ENABLED_COPY,
  PassthroughModeCard,
  PassthroughModeCardProps,
} from './PassthroughModeCard';

describe('PassthroughModeCard', () => {
  function setup(props: PassthroughModeCardProps) {
    const store = getMockAuthStore();

    return render(
      <Provider store={store}>
        <Portal />
        <PassthroughModeCard {...props} />
      </Provider>
    );
  }

  it('opens the dialog', async () => {
    const { getByText, queryByRole } = setup({ usageMode: UsageMode.DEFAULT });

    expect(queryByRole('alertdialog')).toBeNull();
    fireEvent.click(getByText('Enable'));
    await waitForDialogsToOpen();
    expect(queryByRole('alertdialog')).not.toBeNull();
  });

  describe('content', () => {
    it('displays appropriate text when disabled', () => {
      const { queryByText } = setup({ usageMode: UsageMode.DEFAULT });
      expect(queryByText(DISABLED_COPY)).not.toBeNull();
      expect(queryByText(ENABLED_COPY)).toBeNull();
    });

    it('displays appropriate text when enabled', () => {
      const { queryByText } = setup({ usageMode: UsageMode.PASSTHROUGH });
      expect(queryByText(ENABLED_COPY)).not.toBeNull();
      expect(queryByText(DISABLED_COPY)).toBeNull();
    });
  });
});
