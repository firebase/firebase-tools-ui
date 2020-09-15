/**
 * Copyright 2019 Google LLC
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
import React from 'react';

import { delay } from '../../../test_utils';
import { renderDialogWithFirestore } from '../../Firestore/testing/test_utils';
import { fakeReference } from '../testing/models';
import { CloneDialog } from './CloneDialog';

const setup = async () => {
  const onComplete = jest.fn();
  const parent = fakeReference({ key: 'parent', path: 'parent' });
  const ROOT_REF = fakeReference({ key: null, parent: null });
  const ref = fakeReference({
    parent,
    key: 'to_clone',
    path: 'parent/to_clone',
    data: { bool: true, number: 1234, string: 'a string', json: { a: 'b' } },
  });
  ROOT_REF.child.mockReturnValue(ref);
  ref.root = ROOT_REF;
  ref.child.mockReturnValue(ref);

  const {
    getByText,
    getByLabelText,
    getByTestId,
  } = await renderDialogWithFirestore(async firestore => (
    <CloneDialog onComplete={onComplete} realtimeRef={ref} />
  ));
  return { ref, onComplete, getByLabelText, getByText, getByTestId };
};

it('uses a filtered data set when query params are provided', async () => {
  const rootRef = fakeReference({
    parent: null,
    key: null,
    path: '/',
    data: {},
  });

  const todosRef = fakeReference({
    parent: rootRef,
    key: 'todos',
    path: '/todos',
    data: {
      one: { title: 'Not done', completed: false },
      two: { title: 'Totally done', completed: true },
    },
  });

  const todosQuery = fakeReference({
    parent: rootRef,
    key: 'todos',
    path: '/todos',
    data: {
      one: { title: 'Not done', completed: false },
    },
  });

  const { getByLabelText } = await renderDialogWithFirestore(async () => (
    <CloneDialog
      onComplete={jest.fn()}
      realtimeRef={todosRef}
      query={todosQuery}
    />
  ));

  expect(() => getByLabelText(/two:/)).toThrowError();
  expect(getByLabelText(/one:/)).toBeDefined();
});

it('fails when trying to clone the root', async () => {
  spyOn(console, 'error'); // hide expected errors

  const rootRef = fakeReference({
    parent: null,
    key: null,
    path: '/',
    data: {},
  });

  expect(() =>
    render(<CloneDialog onComplete={jest.fn()} realtimeRef={rootRef} />)
  ).toThrow();
});

it('shows a title with the key to clone', async () => {
  const { getByText } = await setup();

  expect(getByText(/Clone "to_clone"/)).not.toBeNull();
});

it('defaults the new destination path to /parent/<key>_copy', async () => {
  const { getByLabelText } = await setup();

  expect(getByLabelText('New destination path:').value).toBe(
    '/parent/to_clone_copy'
  );
});

it('contains an input and json value for each field', async () => {
  const { getByLabelText } = await setup();

  expect(getByLabelText(/bool:/).value).toBe('true');
  expect(getByLabelText(/number:/).value).toBe('1234');
  expect(getByLabelText(/string:/).value).toBe('"a string"');
  expect(getByLabelText(/json:/).value).toBe('{"a":"b"}');
});

it('clones dialog data when the dialog is accepted', async () => {
  const { ref, getByText, getByLabelText } = await setup();

  act(() => {
    fireEvent.change(getByLabelText('string:'), {
      target: {
        value: '"new string"',
      },
    });
  });

  act(() => {
    fireEvent.change(getByLabelText('number:'), {
      target: {
        value: '12',
      },
    });
  });

  act(() => {
    fireEvent.change(getByLabelText('json:'), {
      target: {
        value: '{"x": "y"}',
      },
    });
  });

  await act(async () => {
    fireEvent.submit(getByText('Clone'));
    await delay(100); // Wait for the dialog DOM changes to settle.
  });

  expect(ref.root.child).toHaveBeenCalledWith('/parent/to_clone_copy');
  expect(ref.set).toHaveBeenCalledWith({
    bool: true,
    number: 12,
    string: 'new string',
    json: {
      x: 'y',
    },
  });
});

it('calls onComplete with new key value when accepted', async () => {
  const { getByText, onComplete } = await setup();

  act(() => {
    fireEvent.submit(getByText('Clone'));
  });

  expect(onComplete).toHaveBeenCalledWith('/parent/to_clone_copy');
});

it('does not set data when the dialog is cancelled', async () => {
  const { ref, getByText } = await setup();

  act(() => {
    getByText('Cancel').click();
  });

  expect(ref.set).not.toHaveBeenCalled();
});

it('calls onComplete with undefined when cancelled', async () => {
  const { getByText, onComplete } = await setup();

  act(() => getByText('Cancel').click());

  expect(onComplete).toHaveBeenCalledWith();
});
