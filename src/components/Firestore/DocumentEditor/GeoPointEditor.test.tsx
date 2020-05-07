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
import { firestore } from 'firebase';
import React from 'react';
import { FormContext, useForm } from 'react-hook-form';

import GeoPointEditor from './GeoPointEditor';

const TestForm: React.FC = ({ children }) => {
  const methods = useForm();
  return <FormContext {...methods}>{children}</FormContext>;
};

it('renders an editor for a geo-point', () => {
  const onChange = jest.fn();
  const { getByLabelText } = render(
    <TestForm>
      <GeoPointEditor
        name="foo"
        value={new firestore.GeoPoint(12, 42)}
        onChange={onChange}
      />
    </TestForm>
  );

  expect(getByLabelText('Latitude').value).toBe('12');
  expect(getByLabelText('Longitude').value).toBe('42');
});

it('updates the latitude', async () => {
  const onChange = jest.fn();
  const { getByText, getByLabelText } = render(
    <TestForm>
      <GeoPointEditor
        value={new firestore.GeoPoint(12, 42)}
        onChange={onChange}
      />
    </TestForm>
  );

  await act(async () => {
    fireEvent.change(getByLabelText(/Latitude/), {
      target: { value: '' },
    });
  });
  expect(getByText(/Required/)).not.toBeNull();

  await act(async () => {
    fireEvent.change(getByLabelText(/Latitude/), {
      target: { value: '-13.2' },
    });
  });

  expect(getByLabelText('Latitude').value).toBe('-13.2');
  expect(onChange).toHaveBeenCalledWith(new firestore.GeoPoint(-13.2, 42));
});

it('updates the longitude', async () => {
  const onChange = jest.fn();
  const { getByLabelText, getByText } = render(
    <TestForm>
      <GeoPointEditor
        value={new firestore.GeoPoint(12, 42)}
        onChange={onChange}
      />
    </TestForm>
  );

  await act(async () => {
    fireEvent.change(getByLabelText(/Longitude/), {
      target: { value: '-181' },
    });
  });
  expect(onChange).not.toHaveBeenCalled();
  expect(getByText(/Must be >= -180/)).not.toBeNull();

  await act(async () => {
    fireEvent.change(getByLabelText(/Longitude/), {
      target: { value: '-43' },
    });
  });

  expect(getByLabelText('Longitude').value).toBe('-43');
  expect(onChange).toHaveBeenCalledWith(new firestore.GeoPoint(12, -43));
});
