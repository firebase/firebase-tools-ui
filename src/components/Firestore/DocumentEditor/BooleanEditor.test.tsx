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

import BooleanEditor from './BooleanEditor';

it('renders an editor for a boolean', async () => {
  const onChange = jest.fn();
  const { getByLabelText } = render(
    <BooleanEditor value={true} onChange={onChange} />
  );

  // Wait for selects to be stable
  await new Promise((resolve) => setTimeout(resolve, 500));

  expect((getByLabelText('Value') as HTMLInputElement).value).toBe('true');

  act(() => {
    fireEvent.change(getByLabelText('Value'), { target: { value: 'false' } });
  });

  expect(onChange).toHaveBeenCalledWith(false);
});
