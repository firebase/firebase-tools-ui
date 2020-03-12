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

import 'mutationobserver-shim';
import React from 'react';
import { render, wait, fireEvent } from '@testing-library/react';

import {
  fakeCollectionReference,
  fakeDocumentReference,
} from '../testing/models';
import { AddCollectionDialog } from './AddCollectionDialog';
import { act } from 'react-dom/test-utils';

const docRef = fakeDocumentReference({
  id: 'random-identifier',
});
const collectionReference = fakeCollectionReference({
  id: 'my-stuff',
  path: 'users/bob/my-stuff',
  doc: jest.fn(),
});
collectionReference.doc.mockReturnValue(docRef);

it('shows correct title', () => {
  const { getByText } = render(
    <AddCollectionDialog
      open={true}
      collectionRef={collectionReference}
      onValue={() => {}}
    />
  );

  expect(getByText(/Add a document/)).not.toBeNull();
});

it('shows the (disabled) creation path', () => {
  const { getByLabelText } = render(
    <AddCollectionDialog
      open={true}
      collectionRef={collectionReference}
      onValue={() => {}}
    />
  );

  expect(getByLabelText('Parent path').value).toBe('users/bob/my-stuff');
  expect(getByLabelText('Parent path').disabled).toBe(true);
});

it('auto generates an id', () => {
  const { getByLabelText } = render(
    <AddCollectionDialog
      open={true}
      collectionRef={collectionReference}
      onValue={() => {}}
    />
  );

  expect(getByLabelText('Document ID').value).toBe('random-identifier');
});

it('provides a JSON box', () => {
  const { getByLabelText } = render(
    <AddCollectionDialog
      open={true}
      collectionRef={collectionReference}
      onValue={() => {}}
    />
  );

  expect(getByLabelText('JSON data').value).toBe('{"a": "b"}');
});

it('emits id and JSON parsed data when [Save] is clicked', async () => {
  const onValue = jest.fn();
  const { getByText, getByLabelText } = render(
    <AddCollectionDialog
      open={true}
      collectionRef={collectionReference}
      onValue={onValue}
    />
  );

  fireEvent.change(getByLabelText('Document ID'), {
    target: { value: 'new-document-id' },
  });
  fireEvent.change(getByLabelText('JSON data'), {
    target: { value: '{"b": "c"}' },
  });

  act(() => getByText('Save').click());

  await wait();

  expect(onValue).toHaveBeenCalledWith({
    id: 'new-document-id',
    data: { b: 'c' },
  });
});

it('emits null when [Cancel] is clicked', async () => {
  const onValue = jest.fn();
  const { getByText, getByLabelText } = render(
    <AddCollectionDialog
      open={true}
      collectionRef={collectionReference}
      onValue={onValue}
    />
  );

  fireEvent.change(getByLabelText('Document ID'), {
    target: { value: 'new-document-id' },
  });

  act(() => getByText('Cancel').click());

  await wait();

  expect(onValue).toHaveBeenCalledWith(null);
});
