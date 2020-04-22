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

import { Field, SelectField } from './Field';

describe('<Field>', () => {
  it('renders an input with attached label', () => {
    const { getByLabelText } = render(<Field label="My label" />);

    expect(getByLabelText('My label')).not.toBeNull();
  });

  it('renders an input with given value', () => {
    const { getByLabelText } = render(
      <Field label="My label" value="val" onChange={jest.fn()} />
    );

    expect(getByLabelText('My label').value).toBe('val');
  });

  it('shows a tip below', () => {
    const { getByText } = render(<Field label="My label" tip="A tip!" />);

    expect(getByText('A tip!')).not.toBeNull();
  });

  it('shows an error instead of the tip', () => {
    const { getByText, queryByText } = render(
      <Field label="My label" tip="A tip!" error="Missing!" />
    );

    expect(queryByText('A tip!')).toBeNull();
    expect(getByText('Missing!')).not.toBeNull();
  });

  it('passes through onChange', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <Field label="My label" onChange={onChange} value="initial" />
    );

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(getByLabelText('My label'), {
      target: { value: 'updated value' },
    });

    expect(onChange).toHaveBeenCalled();
  });
});

describe('<SelectField>', () => {
  it('renders a select with attached label', () => {
    const { getByLabelText } = render(<SelectField label="My label" />);

    expect(getByLabelText('My label')).not.toBeNull();
  });

  it('renders a select with given value', () => {
    const { getByLabelText, getByText } = render(
      <SelectField
        label="My label"
        value="val"
        onChange={jest.fn()}
        options={[{ value: 'val', label: 'Val!' }]}
      />
    );

    expect(getByLabelText('My label').value).toBe('val');
    expect(getByText('Val!')).not.toBeNull();
  });

  it('shows a tip below', () => {
    const { getByText } = render(<SelectField label="My label" tip="A tip!" />);

    expect(getByText('A tip!')).not.toBeNull();
  });

  it('shows an error instead of the tip', () => {
    const { getByText, queryByText } = render(
      <SelectField label="My label" tip="A tip!" error="Missing!" />
    );

    expect(queryByText('A tip!')).toBeNull();
    expect(getByText('Missing!')).not.toBeNull();
  });

  it('passes through onChange', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <SelectField label="My label" onChange={onChange} value="initial" />
    );

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(getByLabelText('My label'), {
      target: { value: 'updated value' },
    });

    expect(onChange).toHaveBeenCalled();
  });
});
