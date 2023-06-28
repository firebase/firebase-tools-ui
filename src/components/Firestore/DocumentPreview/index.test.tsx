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

import {
  RenderResult,
  act,
  fireEvent,
  queryAllByRole,
  waitFor,
} from '@testing-library/react';
import { DocumentReference, doc, setDoc } from 'firebase/firestore';
import React from 'react';
import { useFirestoreDocData } from 'reactfire';

import { renderWithFirestore } from '../testing/FirestoreTestProviders';
import DocumentPreview from './index';

const TestDocument: React.FC<{ docRef: DocumentReference }> = ({ docRef }) => {
  const { data } = useFirestoreDocData(docRef);
  return <div>{JSON.stringify(data)}</div>;
};

describe('loaded document', () => {
  let result: RenderResult;
  let documentReference: DocumentReference;

  beforeEach(async () => {
    result = await renderWithFirestore(async (firestore) => {
      documentReference = doc(firestore, 'my-stuff/an-item');
      await setDoc(documentReference, { foo: 'bar' });
      return (
        <>
          <DocumentPreview reference={documentReference} />
          <TestDocument docRef={documentReference} />
        </>
      );
    });

    await waitFor(() => result.getAllByText(/foo/).length);
  });

  it('adds a new field', async () => {
    const { getByText, getByLabelText, findByText } = result;

    await act(async () => getByText('Add field').click());

    fireEvent.change(getByLabelText('Field'), {
      target: { value: 'new' },
    });

    fireEvent.change(getByLabelText('Value'), {
      target: { value: '42' },
    });

    act(() => {
      fireEvent.submit(getByText('Save'));
    });

    expect(await findByText(/"new":"42"/)).not.toBeNull();
  });

  it('renders a field', () => {
    const { getByText } = result;

    expect(getByText('foo')).not.toBe(null);
    expect(getByText('"bar"')).not.toBe(null);
    expect(getByText('(string)')).not.toBe(null);
  });

  it('deletes a field', async () => {
    const { findByText, getByText } = result;

    act(() => {
      getByText('delete').click();
    });

    expect(await findByText('This document has no data')).not.toBeNull();
  });

  it('updates a field-value', async () => {
    const { findByText, getByLabelText, getByText } = result;

    act(() => {
      getByText('edit').click();
    });

    fireEvent.change(getByLabelText('Value'), {
      target: { value: 'new' },
    });

    fireEvent.submit(getByText('Save'));

    expect(await findByText(/"foo":"new"/)).not.toBeNull();
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
  let documentReference: DocumentReference;

  beforeEach(async () => {
    result = await renderWithFirestore(async (firestore) => {
      documentReference = doc(firestore, 'not/here');
      return (
        <>
          <DocumentPreview reference={documentReference} />
          <TestDocument docRef={documentReference} />
        </>
      );
    });

    await waitFor(() => result.getByText(/Add field/));
  });

  it('shows a warning', async () => {
    const { getByText } = result;

    expect(getByText(/This document does not exist/)).not.toBeNull();
  });

  it('calls ref.set() when adding a field', async () => {
    const { findByText, queryByText, getByText, getByLabelText } = result;

    act(() => getByText('Add field').click());

    fireEvent.change(getByLabelText('Field'), {
      target: { value: 'meaningOfLife' },
    });

    fireEvent.change(getByLabelText('Value'), {
      target: { value: '42' },
    });

    await act(async () => {
      fireEvent.submit(getByText('Save'));
    });

    await waitFor(() => !queryByText('Save'));

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(await findByText(/"meaningOfLife":"42"/)).not.toBeNull();
  });
}); // missing document

describe('empty document', () => {
  let result: RenderResult;
  let documentReference: DocumentReference;

  beforeEach(async () => {
    result = await renderWithFirestore(async (firestore) => {
      documentReference = doc(firestore, 'iam/empty');
      await setDoc(documentReference, {}); // exists but has no fields
      return (
        <>
          <DocumentPreview reference={documentReference} />
          <TestDocument docRef={documentReference} />
        </>
      );
    });

    await waitFor(() => result.getByText(/Add field/));
  });

  it('shows message about no data', async () => {
    const { getByText } = result;

    expect(getByText(/This document has no data/)).not.toBeNull();
  });

  it('calls ref.update() when adding a field, not ref.set()', async () => {
    const { findByText, queryByText, getByText, getByLabelText } = result;

    await act(async () => getByText('Add field').click());

    fireEvent.change(getByLabelText('Field'), {
      target: { value: 'meaningOfLife' },
    });

    fireEvent.change(getByLabelText('Value'), {
      target: { value: '42' },
    });

    await act(async () => {
      fireEvent.submit(getByText('Save'));
    });

    await waitFor(() => !queryByText('Save'));

    expect(await findByText(/"meaningOfLife":"42"/)).not.toBeNull();
  });
}); // empty document

describe('loaded array', () => {
  let result: RenderResult;
  let documentReference: DocumentReference;

  beforeEach(async () => {
    result = await renderWithFirestore(async (firestore) => {
      documentReference = doc(firestore, 'foo/bar');
      await setDoc(documentReference, {
        foo: ['alpha', 'bravo', 'bravo'],
      });
      return (
        <>
          <DocumentPreview reference={documentReference} maxSummaryLen={1000} />
          <TestDocument docRef={documentReference} />
        </>
      );
    });

    await waitFor(() => result.getAllByText(/foo/).length);
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

  it('deletes a top-level array element', async () => {
    const { findByText, queryAllByText, queryAllByRole } = result;
    // delete the alpha-element
    act(() => {
      queryAllByText('delete')[1].click();
    });

    act(() => {
      queryAllByRole('button')[0].click();
    });

    expect(await findByText(/"foo":\["bravo","bravo"\]/)).not.toBeNull();
  });

  it('array elements keys are immutable', async () => {
    const { getByLabelText, queryAllByText } = result;
    // update the bravo-element
    await act(async () => queryAllByText('edit')[1].click());
    expect((getByLabelText('Index') as HTMLInputElement).disabled).toBe(true);
  });

  it('updates a top-level array element', async () => {
    const { findByText, getByLabelText, getByText, queryAllByText } = result;
    // update the bravo-element
    act(() => {
      queryAllByText('edit')[1].click();
    });
    fireEvent.change(getByLabelText('Value'), {
      target: { value: 'new' },
    });
    fireEvent.submit(getByText('Save'));
    expect(await findByText(/"foo":\["alpha","new","bravo"\]/)).not.toBeNull();
  });

  it('adds a top-level array element', async () => {
    const { findByText, getByLabelText, getByText, queryAllByText } = result;
    // ignore top-level add
    act(() => {
      queryAllByText('add')[1].click();
    });

    expect((getByLabelText('Index') as HTMLInputElement).value).toBe('3');

    fireEvent.change(getByLabelText('Value'), {
      target: { value: 'new' },
    });
    fireEvent.submit(getByText('Save'));
    expect(
      await findByText(/"foo":\["alpha","bravo","bravo","new"\]/)
    ).not.toBeNull();
  });
});

describe('loaded map', () => {
  let result: RenderResult;
  let documentReference: DocumentReference;

  beforeEach(async () => {
    result = await renderWithFirestore(async (firestore) => {
      documentReference = doc(firestore, 'foo/bar');
      await setDoc(documentReference, {
        foo: {
          last_name: 'potter',
          first_name: 'harry',
        },
      });
      return (
        <>
          <DocumentPreview reference={documentReference} maxSummaryLen={1000} />
          <TestDocument docRef={documentReference}></TestDocument>
        </>
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
    const { findByText, getByLabelText, getByText, queryAllByText } = result;

    act(() => {
      // Edit first-name
      queryAllByText('edit')[0].click();
    });
    fireEvent.change(getByLabelText('Value'), {
      target: { value: 'new' },
    });
    fireEvent.submit(getByText('Save'));
    expect(await findByText(/"first_name":"new"/)).not.toBeNull();
  });

  it('adds a map element', async () => {
    const { findByText, getByLabelText, getByText, queryAllByText } = result;
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
    expect(await findByText(/"wow":"new"/)).not.toBeNull();
  });
});
