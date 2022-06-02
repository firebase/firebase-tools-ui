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

import { RenderResult, act, fireEvent, waitFor } from '@testing-library/react';
import firebase from 'firebase/compat';
import React from 'react';

import { renderWithFirestore } from '../testing/FirestoreTestProviders';
import DocumentPreview from './index';

describe('loaded document', () => {
  let result: RenderResult;
  let documentReference: firebase.firestore.DocumentReference;

  beforeEach(async () => {
    result = await renderWithFirestore(async (firestore) => {
      documentReference = firestore.doc('my-stuff/an-item');
      await documentReference.set({ foo: 'bar' });
      documentReference.update = jest.fn();
      return <DocumentPreview reference={documentReference} />;
    });

    await waitFor(() => result.getByText(/foo/));
  });

  it('adds a new field', async () => {
    const { getByText, getByLabelText } = result;

    await act(async () => getByText('Add field').click());

    act(() => {
      fireEvent.change(getByLabelText('Field'), {
        target: { value: 'new' },
      });
    });

    act(() => {
      fireEvent.change(getByLabelText('Value'), {
        target: { value: '42' },
      });
    });

    act(() => {
      fireEvent.submit(getByText('Save'));
    });

    expect(documentReference.update).toHaveBeenCalledWith(
      new firebase.firestore.FieldPath('new'),
      '42'
    );
  });

  it('renders a field', () => {
    const { getByText } = result;

    expect(getByText('foo')).not.toBe(null);
    expect(getByText('"bar"')).not.toBe(null);
    expect(getByText('(string)')).not.toBe(null);
  });

  it('deletes a field', () => {
    const { getByText } = result;

    act(() => {
      getByText('delete').click();
    });

    expect(documentReference.update).toHaveBeenCalledWith(
      new firebase.firestore.FieldPath('foo'),
      firebase.firestore.FieldValue.delete()
    );
  });

  it('updates a field-value', () => {
    const { getByLabelText, getByText } = result;

    act(() => {
      getByText('edit').click();
    });

    fireEvent.change(getByLabelText('Value'), {
      target: { value: 'new' },
    });

    fireEvent.submit(getByText('Save'));

    expect(documentReference.update).toHaveBeenCalledWith(
      new firebase.firestore.FieldPath('foo'),
      'new'
    );
  });

  // TODO: these are definitely immutable, but cannot figure out how to trigger
  // an event on the uncontrolled-input
  it('field-names are immutable', async () => {
    const { getByLabelText, getByText } = result;

    await act(async () => {
      getByText('edit').click();
    });

    expect((getByLabelText('Field') as HTMLInputElement).disabled).toBe(true);
  });

  it('does not show `add` a field', () => {
    const { queryAllByText } = result;

    expect(queryAllByText('add').length).toBe(1);
  });
});

describe('missing document', () => {
  let result: RenderResult;
  let documentReference: firebase.firestore.DocumentReference;

  beforeEach(async () => {
    result = await renderWithFirestore(async (firestore) => {
      documentReference = firestore.doc('not/here');
      documentReference.set = jest.fn();
      return <DocumentPreview reference={documentReference} />;
    });

    await waitFor(() => result.getByText(/Add field/));
  });

  it('shows a warning', async () => {
    const { getByText } = result;

    expect(getByText(/This document does not exist/)).not.toBeNull();
  });

  it('calls ref.set() when adding a field', async () => {
    const { queryByText, getByText, getByLabelText } = result;

    act(() => getByText('Add field').click());

    act(() => {
      fireEvent.change(getByLabelText('Field'), {
        target: { value: 'meaningOfLife' },
      });
    });

    act(() => {
      fireEvent.change(getByLabelText('Value'), {
        target: { value: '42' },
      });
    });

    await act(async () => {
      fireEvent.submit(getByText('Save'));
    });

    await waitFor(() => !queryByText('Save'));

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(documentReference.set).toHaveBeenCalledWith({ meaningOfLife: '42' });
  });
}); // missing document

describe('empty document', () => {
  let result: RenderResult;
  let documentReference: firebase.firestore.DocumentReference;

  beforeEach(async () => {
    result = await renderWithFirestore(async (firestore) => {
      documentReference = firestore.doc('iam/empty');
      await documentReference.set({}); // exists but has no fields
      documentReference.set = jest.fn();
      documentReference.update = jest.fn();
      return <DocumentPreview reference={documentReference} />;
    });

    await waitFor(() => result.getByText(/Add field/));
  });

  it('shows message about no data', async () => {
    const { getByText } = result;

    expect(getByText(/This document has no data/)).not.toBeNull();
  });

  it('calls ref.update() when adding a field, not ref.set()', async () => {
    const { queryByText, getByText, getByLabelText } = result;

    await act(async () => getByText('Add field').click());

    act(() => {
      fireEvent.change(getByLabelText('Field'), {
        target: { value: 'meaningOfLife' },
      });
    });

    act(() => {
      fireEvent.change(getByLabelText('Value'), {
        target: { value: '42' },
      });
    });

    await act(async () => {
      fireEvent.submit(getByText('Save'));
    });

    await waitFor(() => !queryByText('Save'));

    expect(documentReference.update).toHaveBeenCalledWith(
      new firebase.firestore.FieldPath('meaningOfLife'),
      '42'
    );
    expect(documentReference.set).not.toHaveBeenCalled();
  });
}); // empty document

describe('loaded array', () => {
  let result: RenderResult;
  let documentReference: firebase.firestore.DocumentReference;

  beforeEach(async () => {
    result = await renderWithFirestore(async (firestore) => {
      documentReference = firestore.doc('foo/bar');
      documentReference.update = jest.fn();
      await documentReference.set({
        foo: ['alpha', 'bravo', 'bravo'],
      });
      return (
        <DocumentPreview reference={documentReference} maxSummaryLen={1000} />
      );
    });

    await waitFor(() => result.getByText(/foo/));
  });

  it('renders a field', () => {
    const { getByText, findByText } = result;

    expect(getByText('["alpha", "bravo", "bravo"]')).not.toBe(null);
    expect(findByText('(array)')).not.toBe(null);
  });

  it('shows child-elements when expanded', () => {
    const { getByText, queryByText } = result;

    expect(getByText('"alpha"')).not.toBe(null);
    expect(getByText('1')).not.toBe(null);

    act(() => {
      getByText('["alpha", "bravo", "bravo"]').click();
    });

    expect(queryByText('"alpha"')).toBe(null);
    expect(queryByText('"bravo"')).toBe(null);
  });

  it('deletes a top-level array element', () => {
    const { queryAllByText } = result;
    // delete the alpha-element
    act(() => {
      queryAllByText('delete')[1].click();
    });

    expect(documentReference.update).toHaveBeenCalledWith(
      new firebase.firestore.FieldPath('foo'),
      ['bravo', 'bravo']
    );
  });

  it('array elements keys are immutable', async () => {
    const { getByLabelText, getByText, queryAllByText } = result;
    // update the bravo-element
    await act(async () => queryAllByText('edit')[1].click());
    expect((getByLabelText('Index') as HTMLInputElement).disabled).toBe(true);
  });

  it('updates a top-level array element', () => {
    const { getByLabelText, getByText, queryAllByText } = result;
    // update the bravo-element
    act(() => {
      queryAllByText('edit')[1].click();
    });
    fireEvent.change(getByLabelText('Value'), {
      target: { value: 'new' },
    });
    fireEvent.submit(getByText('Save'));
    expect(documentReference.update).toHaveBeenCalledWith(
      new firebase.firestore.FieldPath('foo'),
      ['alpha', 'new', 'bravo']
    );
  });

  it('adds a top-level array element', () => {
    const { getByLabelText, getByText, queryAllByText } = result;
    // ignore top-level add
    act(() => {
      queryAllByText('add')[1].click();
    });

    expect((getByLabelText('Index') as HTMLInputElement).value).toBe('3');

    fireEvent.change(getByLabelText('Value'), {
      target: { value: 'new' },
    });
    fireEvent.submit(getByText('Save'));
    expect(documentReference.update).toHaveBeenCalledWith(
      new firebase.firestore.FieldPath('foo'),
      ['alpha', 'bravo', 'bravo', 'new']
    );
  });
});

describe('loaded map', () => {
  let result: RenderResult;
  let documentReference: firebase.firestore.DocumentReference;

  beforeEach(async () => {
    result = await renderWithFirestore(async (firestore) => {
      documentReference = firestore.doc('foo/bar');
      documentReference.update = jest.fn();
      await documentReference.set({
        foo: {
          last_name: 'potter',
          first_name: 'harry',
        },
      });
      return (
        <DocumentPreview reference={documentReference} maxSummaryLen={1000} />
      );
    });

    await waitFor(() => result.getAllByText(/harry/).length > 0);
  });

  it('renders a field, in the lexicographical order', () => {
    const { getByText } = result;

    expect(getByText('{first_name: "harry", last_name: "potter"}')).not.toBe(
      null
    );
    expect(getByText('(map)')).not.toBe(null);
  });

  it('shows child-elements when expanded', () => {
    const { getByText, queryByText } = result;

    expect(getByText('first_name')).not.toBe(null);
    expect(getByText('last_name')).not.toBe(null);

    act(() => {
      getByText('{first_name: "harry", last_name: "potter"}').click();
    });

    expect(queryByText('first_name')).toBe(null);
    expect(queryByText('last_name')).toBe(null);
  });

  it('map elements keys are immutable', async () => {
    const { getByLabelText, queryAllByText } = result;
    await act(async () => {
      queryAllByText('edit')[1].click();
    });
    expect((getByLabelText('Field') as HTMLInputElement).disabled).toBe(true);
  });

  it('updates a map element', async () => {
    const { getByLabelText, getByText, queryAllByText } = result;

    act(() => {
      // Edit first-name
      queryAllByText('edit')[0].click();
    });
    fireEvent.change(getByLabelText('Value'), {
      target: { value: 'new' },
    });
    fireEvent.submit(getByText('Save'));
    expect(documentReference.update).toHaveBeenCalledWith(
      new firebase.firestore.FieldPath('foo', 'first_name'),
      'new'
    );
  });

  it('adds a map element', () => {
    const { getByLabelText, getByText, queryAllByText } = result;
    // ignore top-level add
    act(() => {
      queryAllByText('add')[1].click();
    });
    fireEvent.change(getByLabelText('Field'), {
      target: { value: 'wow' },
    });
    fireEvent.blur(getByLabelText('Field'));
    fireEvent.change(getByLabelText('Value'), {
      target: { value: 'new' },
    });
    fireEvent.submit(getByText('Save'));
    expect(documentReference.update).toHaveBeenCalledWith(
      new firebase.firestore.FieldPath('foo', 'wow'),
      'new'
    );
  });
});
