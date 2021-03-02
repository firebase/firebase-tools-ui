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

import { AuthFilter } from './AuthFilter';

const initialInputValue = 'pirojok';

function setup(filter = initialInputValue) {
  const updateFilter = jest.fn();
  const result = render(
    <AuthFilter filter={filter} updateFilter={updateFilter} />
  );

  return { updateFilter, ...result };
}

describe('Auth filter text', () => {
  it('displays the filter value', () => {
    const { getByLabelText } = setup();

    const input = getByLabelText('filter') as HTMLInputElement;
    expect(input.value).toBe(initialInputValue);
  });

  it('updates the store', async () => {
    const filter = 'pirojok';
    const { getByLabelText, updateFilter } = setup('');

    const input = getByLabelText('filter');

    fireEvent.change(input, { target: { value: filter } });

    expect(updateFilter).toHaveBeenCalledWith({ filter });
  });

  describe('clear button', () => {
    it('displays clear button when there is no filter', () => {
      const { getByLabelText, updateFilter } = setup();

      expect(updateFilter).not.toHaveBeenCalled();
      fireEvent.click(getByLabelText('clear'));
      expect(updateFilter).toHaveBeenCalledWith({ filter: '' });
    });

    it('clears on Enter keydown clear button', () => {
      const { getByLabelText, updateFilter } = setup();

      fireEvent.keyDown(getByLabelText('clear'), {
        key: 'Enter',
        keyCode: 13,
      });
      expect(updateFilter).toHaveBeenCalledWith({ filter: '' });
    });

    it('clears on Space keydown clear button', () => {
      const { getByLabelText, updateFilter } = setup();

      fireEvent.keyDown(getByLabelText('clear'), {
        key: 'Space',
        keyCode: 32,
      });
      expect(updateFilter).toHaveBeenCalledWith({ filter: '' });
    });

    it('does not clear for other keys', () => {
      const { getByLabelText, updateFilter } = setup();

      fireEvent.keyDown(getByLabelText('clear'), {
        key: 'Space',
        keyCode: 77,
      });
      expect(updateFilter).not.toHaveBeenCalled();
    });

    it('hides clear button when there is no filter', () => {
      const { queryByLabelText } = setup('');
      expect(queryByLabelText('clear')).toBeNull();
    });
  });
});
