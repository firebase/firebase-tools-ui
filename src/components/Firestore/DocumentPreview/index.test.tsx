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

import { RenderResult, act, fireEvent, render } from '@testing-library/react';
import { firestore } from 'firebase';
import React from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';

import { fakeDocumentReference } from '../testing/models';
import DocumentPreview from './index';

jest.mock('react-firebase-hooks/firestore');

it('renders loading text', () => {
  useDocumentData.mockReturnValueOnce([{}, true]);

  const { getByText } = render(
    <DocumentPreview reference={fakeDocumentReference()} />
  );

  expect(getByText('Loading document...')).not.toBe(null);
});

describe('loaded document', () => {
  let result: RenderResult;
  let documentReference: firestore.DocumentReference;

  beforeEach(async () => {
    useDocumentData.mockReturnValue([
      {
        foo: 'bar',
      },
    ]);
    documentReference = fakeDocumentReference();

    result = render(<DocumentPreview reference={documentReference} />);
  });

  it('adds a new field', () => {
    const { getByText, getByLabelText } = result;

    getByText('Add field').click();
    fireEvent.change(getByLabelText('Field'), {
      target: { value: 'new' },
    });
    fireEvent.blur(getByLabelText('Field'));
    fireEvent.change(getByLabelText('Value'), {
      target: { value: '42' },
    });
    getByText('Save').click();

    expect(documentReference.update).toHaveBeenCalledWith(
      new firestore.FieldPath('new'),
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

    getByText('delete').click();

    expect(documentReference.update).toHaveBeenCalledWith(
      new firestore.FieldPath('foo'),
      firestore.FieldValue.delete()
    );
  });

  it('updates a field-value', () => {
    const { getByLabelText, getByText } = result;

    getByText('edit').click();
    fireEvent.change(getByLabelText('Value'), {
      target: { value: 'new' },
    });
    getByText('Save').click();

    expect(documentReference.update).toHaveBeenCalledWith(
      new firestore.FieldPath('foo'),
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

    expect(getByLabelText('Field').disabled).toBe(true);
  });

  it('does not show `add` a field', () => {
    const { getByText, queryAllByText } = result;

    expect(queryAllByText('add').length).toBe(1);
  });
});

describe('loaded array', () => {
  let result: RenderResult;
  let documentReference: firestore.DocumentReference;

  beforeEach(() => {
    useDocumentData.mockReturnValueOnce([
      {
        foo: ['alpha', 'bravo', 'bravo', ['wowah']],
      },
    ]);
    documentReference = fakeDocumentReference();

    result = render(
      <DocumentPreview reference={documentReference} maxSummaryLen={1000} />
    );
  });

  it('renders a field', () => {
    const { getByText, findByText } = result;

    expect(getByText('["alpha", "bravo", "bravo", ["wowah"]]')).not.toBe(null);
    expect(findByText('(array)')).not.toBe(null);
  });

  it('shows child-elements when expanded', () => {
    const { getByText, queryByText } = result;

    expect(getByText('"alpha"')).not.toBe(null);
    expect(getByText('1')).not.toBe(null);

    getByText('["alpha", "bravo", "bravo", ["wowah"]]').click();

    expect(queryByText('"alpha"')).toBe(null);
    expect(queryByText('"bravo"')).toBe(null);
  });

  it('deletes a top-level array element', () => {
    const { queryAllByText } = result;
    // delete the alpha-element
    queryAllByText('delete')[1].click();
    expect(
      documentReference.update
    ).toHaveBeenCalledWith(new firestore.FieldPath('foo'), [
      'bravo',
      'bravo',
      ['wowah'],
    ]);
  });

  it('array elements keys are immutable', async () => {
    const { getByLabelText, getByText, queryAllByText } = result;
    // update the bravo-element
    await act(async () => queryAllByText('edit')[1].click());
    expect(getByLabelText('Field').disabled).toBe(true);
  });

  it('updates a top-level array element', () => {
    const { getByLabelText, getByText, queryAllByText } = result;
    // update the bravo-element
    queryAllByText('edit')[1].click();
    fireEvent.change(getByLabelText('Value'), {
      target: { value: 'new' },
    });
    getByText('Save').click();
    expect(
      documentReference.update
    ).toHaveBeenCalledWith(new firestore.FieldPath('foo'), [
      'alpha',
      'new',
      'bravo',
      ['wowah'],
    ]);
  });

  it('updates a nested array element', () => {
    const { getByLabelText, getByText, queryAllByText } = result;
    // update the wowah-element
    queryAllByText('edit')[3].click();
    fireEvent.change(getByLabelText('Value'), {
      target: { value: 'new' },
    });
    getByText('Save').click();
    expect(
      documentReference.update
    ).toHaveBeenCalledWith(new firestore.FieldPath('foo'), [
      'alpha',
      'bravo',
      'bravo',
      ['new'],
    ]);
  });

  it('adds a top-level array element', () => {
    const { getByLabelText, getByText, queryAllByText } = result;
    // ignore top-level add
    queryAllByText('add')[1].click();
    fireEvent.change(getByLabelText('Value'), {
      target: { value: 'new' },
    });
    getByText('Save').click();
    expect(
      documentReference.update
    ).toHaveBeenCalledWith(new firestore.FieldPath('foo'), [
      'alpha',
      'bravo',
      'bravo',
      ['wowah'],
      'new',
    ]);
  });

  it('adds a nested array element', () => {
    const { getByLabelText, getByText, queryAllByText } = result;
    // ignore top-level add
    queryAllByText('add')[2].click();
    fireEvent.change(getByLabelText('Value'), {
      target: { value: 'new' },
    });
    getByText('Save').click();
    expect(
      documentReference.update
    ).toHaveBeenCalledWith(new firestore.FieldPath('foo'), [
      'alpha',
      'bravo',
      'bravo',
      ['wowah', 'new'],
    ]);
  });
});

describe('loaded map', () => {
  let result: RenderResult;
  let documentReference: firestore.DocumentReference;

  beforeEach(async () => {
    useDocumentData.mockReturnValueOnce([
      {
        foo: { first_name: 'harry', last_name: 'potter' },
      },
    ]);
    documentReference = fakeDocumentReference();

    await act(async () => {
      result = render(
        <DocumentPreview reference={documentReference} maxSummaryLen={1000} />
      );
    });
  });

  it('renders a field', () => {
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

    getByText('{first_name: "harry", last_name: "potter"}').click();

    expect(queryByText('first_name')).toBe(null);
    expect(queryByText('last_name')).toBe(null);
  });

  it('map elements keys are immutable', async () => {
    const { getByLabelText, getByText, queryAllByText } = result;
    await act(async () => {
      queryAllByText('edit')[1].click();
    });
    expect(getByLabelText('Field').disabled).toBe(true);
  });

  it('updates a map element', async () => {
    const { getByLabelText, getByText, queryAllByText } = result;

    await act(async () => {
      queryAllByText('edit')[1].click();
    });
    await act(async () => {
      fireEvent.change(getByLabelText('Value'), {
        target: { value: 'new' },
      });
    });
    await act(async () => {
      getByText('Save').click();
    });
    expect(documentReference.update).toHaveBeenCalledWith(
      new firestore.FieldPath('foo', 'last_name'),
      'new'
    );
  });

  it('adds a map element', () => {
    const { getByLabelText, getByText, queryAllByText } = result;
    // ignore top-level add
    queryAllByText('add')[1].click();
    fireEvent.change(getByLabelText('Field'), {
      target: { value: 'wow' },
    });
    fireEvent.blur(getByLabelText('Field'));
    fireEvent.change(getByLabelText('Value'), {
      target: { value: 'new' },
    });
    getByText('Save').click();
    expect(documentReference.update).toHaveBeenCalledWith(
      new firestore.FieldPath('foo', 'wow'),
      'new'
    );
  });
});
