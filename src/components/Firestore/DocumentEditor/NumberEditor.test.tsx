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

import NumberEditor from './NumberEditor';

it('renders an editor for a number', () => {
  const onChange = jest.fn();
  const { getByLabelText } = render(
    <NumberEditor value={1} onChange={onChange} />
  );

  expect(getByLabelText('Value').value).toBe('1');

  onChange.mockReset();
  fireEvent.change(getByLabelText('Value'), {
    target: { value: 'foo' },
  });
  expect(onChange).not.toHaveBeenCalled();

  fireEvent.change(getByLabelText('Value'), {
    target: { value: 2 },
  });

  expect(onChange).toHaveBeenCalledWith(2);
});
