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

import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { FormContext, useForm } from 'react-hook-form';

import NumberEditor from './NumberEditor';

const TestForm: React.FC = ({ children }) => {
  const methods = useForm();
  return <FormContext {...methods}>{children}</FormContext>;
};

it('renders an editor for a number', async () => {
  const onChange = jest.fn();
  const { getByLabelText, getByText } = render(
    <TestForm>
      <NumberEditor name="foo" value={1} onChange={onChange} />
    </TestForm>
  );

  expect(getByLabelText(/Value/).value).toBe('1');

  onChange.mockReset();

  await act(async () => {
    fireEvent.change(getByLabelText(/Value/), {
      target: { value: 'foo' },
    });
  });

  expect(onChange).not.toHaveBeenCalled();
  expect(getByText(/Must be a number/)).not.toBeNull();

  await act(async () => {
    fireEvent.change(getByLabelText(/Value/), {
      target: { value: '' },
    });
  });

  expect(onChange).not.toHaveBeenCalled();
  expect(getByText(/Required/)).not.toBeNull();

  await act(async () => {
    fireEvent.change(getByLabelText(/Value/), {
      target: { value: 2 },
    });
  });

  expect(onChange).toHaveBeenCalledWith(2);

  await act(async () => {
    fireEvent.change(getByLabelText(/Value/), {
      target: { value: '-2.5' },
    });
  });

  expect(onChange).toHaveBeenCalledWith(-2.5);

  await act(async () => {
    fireEvent.change(getByLabelText(/Value/), {
      target: { value: '-2.555' },
    });
  });

  expect(onChange).toHaveBeenCalledWith(-2.555);

  await act(async () => {
    fireEvent.change(getByLabelText(/Value/), {
      target: { value: 'Infinity' },
    });
  });

  expect(onChange).toHaveBeenCalledWith(Infinity);
});
