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

import { fireEvent, render } from '@testing-library/react';
import React from 'react';

import { ClearAll } from './ClearAll';
import { confirmClearAll } from './confirmClearAllData';

jest.mock('./confirmClearAllData.tsx');

describe('ClearAll', () => {
  function setup(hasUsers = true) {
    const clearAllData = jest.fn();

    const methods = {
      clearAllData,
      ...render(
        <>
          <ClearAll hasUsers={hasUsers} clearAllData={clearAllData} />
        </>
      ),
    };

    const clickButton = async () => {
      const button = methods.getByText('Clear all data');
      fireEvent.click(button);
    };

    return { ...methods, clickButton, clearAllData };
  }

  it('calls clearAllData callback on button click if user confirms', async () => {
    const { clickButton, clearAllData } = setup();

    confirmClearAll.mockImplementation(() => Promise.resolve(true));
    await clickButton();
    expect(clearAllData).toHaveBeenCalled();
  });

  it("doesn't call clearAllData callback on button click if user cancels", async () => {
    const { clickButton, clearAllData } = setup();

    confirmClearAll.mockImplementation(() => Promise.resolve(false));
    await clickButton();
    expect(clearAllData).not.toHaveBeenCalled();
  });

  it('hides the button of there are no users', () => {
    const { queryByText } = setup(false);

    expect(queryByText('Clear all data')).toBeNull();
  });
});
