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

import { FieldType } from '../models';
import DocumentEditor from './index';

it('renders an editable field', () => {
  const onChange = jest.fn();
  const { getByLabelText, getByPlaceholderText, getByDisplayValue } = render(
    <DocumentEditor value={{ hello: 'world' }} onChange={onChange} />
  );
  expect(getByLabelText('Field').value).toBe('hello');
  // Select does not properly wire up the label aria properly
  expect(getByDisplayValue('string')).not.toBe(null);
  expect(getByLabelText('Value').value).toBe('world');

  fireEvent.change(getByLabelText('Value'), {
    target: { value: 'new' },
  });

  expect(getByLabelText('Value').value).toBe('new');
  expect(onChange).toHaveBeenCalledWith({ hello: 'new' });
});

it('renders an editable field with children', () => {
  const onChange = jest.fn();

  const { getAllByLabelText } = render(
    <DocumentEditor
      value={{ hello: { foo: ['bar', { spam: 'eggs' }] } }}
      onChange={onChange}
    />
  );

  fireEvent.change(getAllByLabelText('Value')[1], {
    target: { value: 'new' },
  });

  expect(onChange).toHaveBeenCalledWith({
    hello: { foo: ['bar', { spam: 'new' }] },
  });
});

it('renders an editable key-field', () => {
  const onChange = jest.fn();
  const { getByLabelText, getByPlaceholderText, getByDisplayValue } = render(
    <DocumentEditor value={{ hello: 'world' }} onChange={onChange} />
  );

  fireEvent.change(getByLabelText('Field'), {
    target: { value: 'new' },
  });
  fireEvent.blur(getByLabelText('Field'));

  expect(getByLabelText('Field').value).toBe('new');
  expect(onChange).toHaveBeenCalledWith({ new: 'world' });
});

describe('changing types', () => {
  let result;
  let setType;

  beforeEach(() => {
    result = render(<DocumentEditor value={{ hello: 'world' }} />);
    const { getByDisplayValue } = result;
    setType = (fieldType: FieldType, displayValue = 'string') =>
      fireEvent.change(getByDisplayValue(displayValue), {
        target: { value: fieldType },
      });
  });

  // TODO: wire up array editor with add child-field functionality
  it.skip('switches to an array', () => {
    const { getByText } = result;
    setType(FieldType.ARRAY);
    expect(getByText('add')).not.toBe(null);
  });

  it('switches to a boolean', () => {
    const { getByDisplayValue } = result;
    setType(FieldType.BOOLEAN);
    expect(getByDisplayValue('true')).not.toBe(null);
  });

  it('switches to a geopoint', () => {
    const { getByLabelText } = result;
    setType(FieldType.GEOPOINT);
    expect(getByLabelText('Latitude')).not.toBe(null);
  });

  // TODO: wire up map editor with add child-field functionality
  it.skip('switches to a map', () => {
    const { getByText } = result;
    setType(FieldType.MAP);
    expect(getByText('add')).not.toBe(null);
  });

  it('switches to null', () => {
    const { queryByLabelText } = result;
    setType(FieldType.NULL);
    expect(queryByLabelText('Value')).toBe(null);
  });

  it('switches to a number', () => {
    const { getByLabelText } = result;
    setType(FieldType.NUMBER);
    expect(getByLabelText('Value').value).toBe('0');
  });

  // TODO: wire up reference editor
  it.skip('switches to a reference', () => {
    const { getByLabelText } = result;
    setType(FieldType.MAP);
    expect(getByLabelText('Value').value).toBe('');
  });

  it('switches to a string', () => {
    const { getByLabelText } = result;
    // set to Number first to get the default String
    setType(FieldType.NUMBER);
    setType(FieldType.STRING, FieldType.NUMBER);
    expect(getByLabelText('Value').value).toBe('');
  });

  it('switches to a timestamp', () => {
    const { getByLabelText } = result;
    setType(FieldType.TIMESTAMP);
    const [date, time] = getByLabelText('Value').value.split('T');
    expect(date).toEqual(expect.stringMatching(/\d{4}-\d{2}-\d{2}/));
  });
});
