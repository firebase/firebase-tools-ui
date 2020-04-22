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

import JsonEditor from './JsonEditor';

const GOOD_PATH = '/wow/cool';

const TestForm: React.FC = ({ children }) => {
  const methods = useForm();
  return <FormContext {...methods}>{children}</FormContext>;
};

it('renders a field with json stringified value', async () => {
  const onChange = jest.fn();
  const { getByLabelText } = render(
    <TestForm>
      <JsonEditor name="foo" value={{ a: 'b' }} onChange={onChange} />
    </TestForm>
  );

  expect(getByLabelText('JSON').value).toBe('{"a":"b"}');
});

it('shows an error on invalid json and does not emit onChange', async () => {
  const onChange = jest.fn();
  const { getByLabelText, getByText } = render(
    <TestForm>
      <JsonEditor name="foo" value={{ a: 'b' }} onChange={onChange} />
    </TestForm>
  );

  await act(async () => {
    fireEvent.change(getByLabelText('JSON'), {
      target: { value: 'not json' },
    });
  });

  expect(onChange).not.toHaveBeenCalled();
  expect(getByText(/Must be valid JSON/)).not.toBeNull();
});

it('emits the JSON parsed value into onChange if valid', async () => {
  const onChange = jest.fn();
  const { getByLabelText } = render(
    <TestForm>
      <JsonEditor name="foo" value={{ a: 'b' }} onChange={onChange} />
    </TestForm>
  );

  await act(async () => {
    fireEvent.change(getByLabelText('JSON'), {
      target: { value: '{"x": "y"}' },
    });
  });

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith({ x: 'y' });
});
