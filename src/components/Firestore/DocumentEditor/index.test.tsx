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

import DocumentEditor from './index';

it('renders an editable field', () => {
  const onChange = jest.fn();
  const { getByDisplayValue, getByPlaceholderText } = render(
    <DocumentEditor value={{ hello: 'world' }} onChange={onChange} />
  );
  expect(getByPlaceholderText('Field').value).toBe('hello');
  expect(getByPlaceholderText('Type').value).toBe('string');

  fireEvent.change(getByDisplayValue('world'), {
    target: { value: 'new' },
  });

  expect(getByDisplayValue('new')).not.toBe(null);
  expect(onChange).toHaveBeenCalledWith({ hello: 'new' });
});

it('renders an editable field with children', () => {
  const onChange = jest.fn();

  const { getByDisplayValue } = render(
    <DocumentEditor
      value={{ hello: { foo: ['bar', { spam: 'eggs' }] } }}
      onChange={onChange}
    />
  );

  fireEvent.change(getByDisplayValue('eggs'), {
    target: { value: 'new' },
  });

  expect(onChange).toHaveBeenCalledWith({
    hello: { foo: ['bar', { spam: 'new' }] },
  });
});
