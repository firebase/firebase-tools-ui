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
import { firestore } from 'firebase';
import React from 'react';

import GeoPointEditor from './GeoPointEditor';

it('renders an editor for a geo-point', () => {
  const onChange = jest.fn();
  const { getByLabelText } = render(
    <GeoPointEditor
      value={new firestore.GeoPoint(12, 42)}
      onChange={onChange}
    />
  );

  expect(getByLabelText('Latitude').value).toBe('12');
  expect(getByLabelText('Longitude').value).toBe('42');
});

it('updates the latitude', () => {
  const onChange = jest.fn();
  const { getByLabelText } = render(
    <GeoPointEditor
      value={new firestore.GeoPoint(12, 42)}
      onChange={onChange}
    />
  );

  onChange.mockReset();
  fireEvent.change(getByLabelText('Latitude'), {
    target: { value: '' },
  });
  expect(onChange).not.toHaveBeenCalled();

  fireEvent.change(getByLabelText('Latitude'), {
    target: { value: '-13' },
  });

  expect(getByLabelText('Latitude').value).toBe('-13');
  expect(onChange).toHaveBeenCalledWith(new firestore.GeoPoint(-13, 42));
});

it('updates the longitude', () => {
  const onChange = jest.fn();
  const { getByLabelText } = render(
    <GeoPointEditor
      value={new firestore.GeoPoint(12, 42)}
      onChange={onChange}
    />
  );

  onChange.mockReset();
  fireEvent.change(getByLabelText('Longitude'), {
    target: { value: '' },
  });
  expect(onChange).not.toHaveBeenCalled();

  fireEvent.change(getByLabelText('Longitude'), {
    target: { value: '-43' },
  });

  expect(getByLabelText('Longitude').value).toBe('-43');
  expect(onChange).toHaveBeenCalledWith(new firestore.GeoPoint(12, -43));
});
