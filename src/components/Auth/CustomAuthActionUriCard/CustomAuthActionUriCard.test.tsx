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

import { waitForDialogsToOpen } from '../../../test_utils';
import { getMockAuthStore } from '../test_utils';
import {
  CustomAuthActionUriCard,
  CustomAuthActionUriCardProps,
} from './CustomAuthActionUriCard';

describe('CustomAuthActionUriCard', () => {
  function setup(props: CustomAuthActionUriCardProps) {
    const store = getMockAuthStore();

    return render(
      <Provider store={store}>
        <Portal />
        <CustomAuthActionUriCard {...props} />
      </Provider>
    );
  }

  it('opens the dialog', async () => {
    const { getByText, queryByRole } = setup({ customAuthActionUri: "https://example.com" });

    expect(queryByRole('alertdialog')).toBeNull();
    fireEvent.click(getByText('Change'));
    await waitForDialogsToOpen();
    expect(queryByRole('alertdialog')).not.toBeNull();
  });

  describe('content', () => {
    it('displays appropriate text when not set', () => {
      const { queryByText } = setup({ customAuthActionUri: "" });
      expect(queryByText(/Default Auth Action Handler/)).not.toBeNull();
      expect(queryByText(/Custom Auth Action Handler/)).toBeNull();
    });

    it('displays appropriate text when set', () => {
      const { queryByText } = setup({ customAuthActionUri: "https://example.com" });
      expect(queryByText(/Default Auth Action Handler/)).toBeNull();
      expect(queryByText(/Custom Auth Action Handler/)).not.toBeNull();
    });
  });
});
