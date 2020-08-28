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
  render,
  wait,
} from '@testing-library/react';
import React from 'react';

import { FieldType } from '../models';
import { renderWithFirestore } from '../testing/FirestoreTestProviders';
import DocumentEditor from './index';

describe('with basic root fields', () => {
  let onChange: () => {};
  let result: RenderResult;
  beforeEach(async () => {
    onChange = jest.fn();
    await act(async () => {
      result = render(
        <DocumentEditor value={{ hello: 'world' }} onChange={onChange} />
      );
    });
  });

  it('renders current field name, type, value', () => {
    const { getByLabelText } = result;

    expect(getByLabelText(/Field/).value).toBe('hello');
    expect(getByLabelText(/Type/).value).toBe('string');
    expect(getByLabelText(/Value/).value).toBe('world');
  });

  it('emits nothing if the field-state is invalid', async () => {
    const { getByLabelText } = result;

    await act(async () => {
      fireEvent.change(getByLabelText(/Field/), {
        target: { value: 'foo' },
      });

      fireEvent.change(getByLabelText(/Field/), {
        target: { value: '' },
      });
    });

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('edits the name', async () => {
    const { getByLabelText } = result;

    await act(async () => {
      fireEvent.change(getByLabelText(/Field/), {
        target: { value: 'new' },
      });
    });

    expect(onChange).toHaveBeenCalledWith({ new: 'world' });
  });

  it('prevents sibling name-collisions', async () => {
    const { getByText, getAllByText, getAllByLabelText, queryByText } = result;

    await act(async () => {
      getByText('add').click();
    });

    await act(async () => {
      fireEvent.change(getAllByLabelText(/Field/)[0], {
        target: { value: 'new' },
      });

      fireEvent.change(getAllByLabelText(/Field/)[1], {
        target: { value: 'new' },
      });
    });

    expect(getAllByText(/Must be unique/).length).toBe(2);

    await act(async () => {
      fireEvent.change(getAllByLabelText(/Field/)[0], {
        target: { value: 'other' },
      });
    });

    expect(queryByText(/Must be unique/)).toBeNull();
  });

  it('edits the value', async () => {
    const { getByLabelText } = result;

    await act(async () => {
      fireEvent.change(getByLabelText(/Value/), {
        target: { value: 'new' },
      });
    });

    expect(getByLabelText(/Value/).value).toBe('new');
    expect(onChange).toHaveBeenCalledWith({ hello: 'new' });
  });

  it('adds root-fields', async () => {
    const { getByText } = result;

    await act(async () => {
      getByText('add').click();
    });
    expect(onChange).toHaveBeenCalledWith({ hello: 'world', '': '' });
  });

  it('removes root-fields', () => {
    const { getByText } = result;

    getByText('delete').click();
    expect(onChange).toHaveBeenCalledWith({});
  });
});

it('renders an editable field with children', async () => {
  const onChange = jest.fn();

  const { getAllByLabelText } = render(
    <DocumentEditor
      value={{ hello: { foo: ['bar', { spam: 'eggs' }] } }}
      onChange={onChange}
    />
  );

  await act(async () => {
    fireEvent.change(getAllByLabelText(/Value/)[1], {
      target: { value: 'new' },
    });
  });

  expect(onChange).toHaveBeenCalledWith({
    hello: { foo: ['bar', { spam: 'new' }] },
  });
});

it('allows nested-arrays by default', async () => {
  const onChange = jest.fn();

  const { getAllByLabelText, getByText } = render(
    <DocumentEditor value={['bar']} onChange={onChange} />
  );

  act(() => getByText('add').click());

  await act(async () => {
    fireEvent.change(getAllByLabelText(/Type/)[1], {
      target: { value: FieldType.ARRAY },
    });
  });

  expect(onChange).toHaveBeenCalledWith(['bar', []]);
});

it('conditionally does not allow nested-arrays', async () => {
  const onChange = jest.fn();

  const { getAllByLabelText, getByText } = render(
    <DocumentEditor
      value={['bar']}
      onChange={onChange}
      supportNestedArrays={false}
    />
  );

  act(() => getByText('add').click());

  await act(async () => {
    fireEvent.change(getAllByLabelText(/Type/)[1], {
      target: { value: FieldType.ARRAY },
    });
  });

  expect(onChange).not.toHaveBeenCalledWith(['bar', []]);
});

it('renders an editable key-field', async () => {
  const onChange = jest.fn();
  const { getByLabelText } = render(
    <DocumentEditor value={{ hello: 'world' }} onChange={onChange} />
  );

  await act(async () => {
    fireEvent.change(getByLabelText('Field'), {
      target: { value: 'new' },
    });
  });

  expect(getByLabelText('Field').value).toBe('new');
  expect(onChange).toHaveBeenCalledWith({ new: 'world' });
});

describe('changing types', () => {
  let result: RenderResult;
  let setType: (fieldType: FieldType) => void;

  beforeEach(async () => {
    await act(async () => {
      result = await renderWithFirestore(async () => (
        <DocumentEditor value={{ hello: 'world' }} />
      ));
    });

    const { getByLabelText } = result;
    setType = (fieldType: FieldType) =>
      fireEvent.change(getByLabelText(/Type/), {
        target: { value: fieldType },
      });
  });

  it('switches to an array', async () => {
    const { getByLabelText, getAllByText } = result;
    await act(async () => {
      setType(FieldType.ARRAY);
    });
    await wait(() => expect(getAllByText('add').length).toBe(2));
  });

  it('switches to a boolean', async () => {
    const { getByLabelText } = result;
    await act(async () => {
      setType(FieldType.BOOLEAN);
    });
    expect(getByLabelText('Value').value).toBe('true');
  });

  it('switches to a geopoint', async () => {
    const { getByLabelText } = result;
    await act(async () => {
      setType(FieldType.GEOPOINT);
    });
    expect(getByLabelText('Latitude')).not.toBe(null);
  });

  it('switches to a map', async () => {
    const { getAllByText } = result;
    await act(async () => {
      setType(FieldType.MAP);
    });
    expect(getAllByText('add').length).toBe(2);
  });

  it('switches to null', async () => {
    const { queryByLabelText } = result;
    await act(async () => {
      setType(FieldType.NULL);
    });
    expect(queryByLabelText(/Value/)).toBe(null);
  });

  it('switches to a number', async () => {
    const { getByLabelText } = result;
    await act(async () => {
      setType(FieldType.NUMBER);
    });
    expect(getByLabelText(/Value/).value).toBe('0');
  });

  it('switches to a reference', async () => {
    const { getByLabelText } = result;
    await act(async () => {
      setType(FieldType.REFERENCE);
    });
    expect(getByLabelText(/Document path/).value).toBe('');
  });

  it('switches to a string', async () => {
    const { getByLabelText } = result;
    // set to Number first to get the default String
    await act(async () => {
      setType(FieldType.NUMBER);
    });
    await act(async () => {
      setType(FieldType.STRING);
    });
    expect(getByLabelText(/Value/).value).toBe('');
  });

  it('switches to a timestamp', async () => {
    const { getByLabelText } = result;
    await act(async () => {
      setType(FieldType.TIMESTAMP);
    });
    const [date, time] = getByLabelText(/Value/).value.split('T');
    expect(date).toEqual(expect.stringMatching(/\d{4}-\d{2}-\d{2}/));
  });
});
