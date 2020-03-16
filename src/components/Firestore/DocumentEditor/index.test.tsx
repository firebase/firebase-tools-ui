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

import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { firestore } from 'firebase';

import { Editor } from './Editor';

it('renders an editable field', () => {
  const onChange = jest.fn();
  const { getByPlaceholderText } = render(
    <Editor rootKey={'hello'} value={'world'} onChange={onChange} />
  );
  expect(getByPlaceholderText('Field').value).toBe('hello');
  expect(getByPlaceholderText('Type').value).toBe('string');
  expect(getByPlaceholderText('Value').value).toBe('world');

  fireEvent.change(getByPlaceholderText('Value'), {
    target: { value: 'new' },
  });

  expect(getByPlaceholderText('Value').value).toBe('new');
  expect(onChange).toHaveBeenCalledWith('new');
});

it('renders an editable field with children', () => {
  const onChange = jest.fn();

  const { getByDisplayValue } = render(
    <Editor
      rootKey={'hello'}
      value={{ foo: ['bar', { spam: 'eggs' }] }}
      onChange={onChange}
    />
  );

  fireEvent.change(getByDisplayValue('eggs'), {
    target: { value: 'new' },
  });

  expect(onChange).toHaveBeenCalledWith({ foo: ['bar', { spam: 'new' }] });
});
