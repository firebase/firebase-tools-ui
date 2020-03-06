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
import { act, render, wait } from '@testing-library/react';
import { firestore } from 'firebase';

import { Field } from './index';
import { DocumentRefProvider } from './DocumentRefContext';
import { fakeDocumentReference } from '../testing/models';

it('renders a string-field', () => {
  const { getByText } = render(
    <DocumentRefProvider value={fakeDocumentReference()}>
      <Field id="hello" value="world" />
    </DocumentRefProvider>
  );
  expect(getByText('hello: "world"')).not.toBeNull();
  expect(getByText('(string)')).not.toBeNull();
});

it('renders a geopoint-field', () => {
  const { getByText } = render(
    <DocumentRefProvider value={fakeDocumentReference()}>
      <Field id="location" value={new firestore.GeoPoint(1, 2)} />
    </DocumentRefProvider>
  );
  expect(getByText('location: {"_lat":1,"_long":2}')).not.toBeNull();
  expect(getByText('(geopoint)')).not.toBeNull();
});

it('deletes a field', () => {
  const docRef = fakeDocumentReference();
  docRef.update = jest.fn();

  const { getByText } = render(
    <DocumentRefProvider value={docRef}>
      <Field id="blah" value="0" />
    </DocumentRefProvider>
  );

  getByText('delete').click();

  expect(docRef.update).toHaveBeenCalledWith({
    blah: firestore.FieldValue.delete(),
  });
});
