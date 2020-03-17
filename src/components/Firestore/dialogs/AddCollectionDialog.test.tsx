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

import { RenderResult, fireEvent, render, wait } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';

import DatabaseApi from '../api';
import {
  fakeCollectionReference,
  fakeDocumentReference,
} from '../testing/models';
import { AddCollectionDialog } from './AddCollectionDialog';

jest.mock('../api');

const rootRef = fakeDocumentReference({
  id: undefined,
  path: '',
});

const api = new DatabaseApi();
api.database = rootRef;

const docRef = fakeDocumentReference({
  id: 'my-doc',
  path: 'docs/my-doc',
});
const collectionReference = fakeCollectionReference({
  id: 'my-col',
  path: 'docs/my-doc/my-col',
  doc: jest.fn(),
});
const autoGenDocRef = fakeDocumentReference({
  id: 'random-id',
});

docRef.collection = jest.fn().mockReturnValue(collectionReference);
collectionReference.doc.mockReturnValue(autoGenDocRef);

it('shows correct title', () => {
  const { getByText } = render(
    <AddCollectionDialog open={true} api={api} onValue={() => {}} />
  );

  expect(getByText(/Start a collection/)).not.toBeNull();
});

describe('step 1', () => {
  it('displays the parent document path', () => {
    const { getByLabelText } = render(
      <AddCollectionDialog
        open={true}
        api={api}
        documentRef={docRef}
        onValue={() => {}}
      />
    );

    expect(getByLabelText(/Parent path/).value).toBe('docs/my-doc');
  });

  it('contains a collection id input', () => {
    const { getByLabelText } = render(
      <AddCollectionDialog open={true} api={api} onValue={() => {}} />
    );

    expect(getByLabelText(/Collection ID/)).not.toBeNull();
  });
}); // step 1

describe('step 2', () => {
  let result: RenderResult;
  let onValue: jest.Mock;

  beforeEach(async () => {
    onValue = jest.fn();
    result = render(
      <AddCollectionDialog
        open={true}
        api={api}
        documentRef={docRef}
        onValue={onValue}
      />
    );
    const { getByText, getByLabelText } = result;

    fireEvent.change(getByLabelText(/Collection ID/), {
      target: { value: 'my-col' },
    });

    act(() => getByText('Next').click());

    await wait();
  });

  it('displays the parent collection path', () => {
    const { getByLabelText } = result;

    expect(getByLabelText(/Parent path/).value).toBe('docs/my-doc/my-col');
  });

  it('contains a document id with random id', () => {
    const { getByLabelText } = result;

    expect(getByLabelText(/Document ID/).value).toBe('random-id');
  });

  it('contains a data input', () => {
    const { getByLabelText } = result;

    expect(getByLabelText(/JSON data/)).not.toBeNull();
  });

  it('emits doc data when clicking [Save]', async () => {
    const { getByText } = result;

    act(() => getByText('Save').click());

    await wait();

    expect(onValue).toHaveBeenCalledWith({
      collectionId: 'my-col',
      document: {
        id: 'random-id',
        data: { a: 'b' },
      },
    });
  });

  it('emits null when clicking [Cancel]', async () => {
    const { getByText } = result;

    act(() => getByText('Cancel').click());

    await wait();

    expect(onValue).toHaveBeenCalledWith(null);
  });
}); // step 2

describe('at the root of the db', () => {
  it('shows the correct parent path', () => {
    const { getByLabelText } = render(
      <AddCollectionDialog open={true} api={api} onValue={() => {}} />
    );

    expect(getByLabelText(/Parent path/).value).toBe('/');
  });
}); // at the root of the db
