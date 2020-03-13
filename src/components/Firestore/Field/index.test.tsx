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
import { act, fireEvent, render } from '@testing-library/react';
import { firestore } from 'firebase';

import { Field } from './index';

it('renders a string-field', () => {
  const { getByText } = render(<Field value={{ hello: 'world' }} />);
  expect(getByText('hello:"world"')).not.toBeNull();
  expect(getByText('(string)')).not.toBeNull();
});

it('renders a geopoint-field', () => {
  const { getByText } = render(
    <Field value={{ location: new firestore.GeoPoint(1, 2) }} />
  );
  expect(getByText('location:{"_lat":1,"_long":2}')).not.toBeNull();
  expect(getByText('(geopoint)')).not.toBeNull();
});

it('renders a map nested field', () => {
  const { getByText } = render(
    <Field value={{ location: { city: 'new york' } }} />
  );
  expect(getByText('city:"new york"')).not.toBeNull();
});

it('renders an array nested field', () => {
  const { getByText } = render(
    <Field value={{ aliases: ['fluffy', 'jumpy'] }} />
  );
  expect(getByText('0:"fluffy"')).not.toBeNull();
  expect(getByText('1:"jumpy"')).not.toBeNull();
});

it('deletes a field', () => {
  const { getByText, queryByText } = render(<Field value={{ old: 'news' }} />);
  getByText('delete').click();
  expect(queryByText('old')).toBeNull();
});

it('edits a field', () => {
  const { getByText, getByPlaceholderText } = render(
    <Field value={{ target: 'old' }} />
  );
  fireEvent.change(getByPlaceholderText('value'), {
    target: { value: 'new' },
  });
  getByText('save').click();

  expect(getByText('target:"new"')).not.toBeNull();
});
