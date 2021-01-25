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

import { act, render } from '@testing-library/react';
import React from 'react';

import { delay } from '../../../../test_utils';
import CopyPathNotification, { SNACKBAR_MESSAGE } from './index';

describe('CopyPathNotification', () => {
  const SET_SHOW_COPY_NOTIFICATION = jest.fn();

  it('render snackbar when showCopyNotification is true', async () => {
    const { findByText } = render(
      <CopyPathNotification
        showCopyNotification
        setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION}
        // Show snackbar indefinitely (just for testing purposes)
        timeout={-1}
      />
    );
    await expect(findByText(SNACKBAR_MESSAGE)).not.toBeNull();
  });

  it('automatically set showCopyNotification to false after closing snackbar', async () => {
    const { findByText } = render(
      <CopyPathNotification
        showCopyNotification
        setShowCopyNotification={SET_SHOW_COPY_NOTIFICATION}
        // Hide snackbar after 100 ms (just for testing purposes)
        timeout={100}
      />
    );
    await expect(findByText(SNACKBAR_MESSAGE)).not.toBeNull();
    // Wait for snackbar to automatically close
    await act(() => delay(150));
    await expect(SET_SHOW_COPY_NOTIFICATION).toHaveBeenCalledWith(false);
  });
});
