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

import { act, fireEvent, render, wait } from '@testing-library/react';
import React from 'react';

import { fakeReference, fakeSnapshot } from '../testing/models';
import { CloneDialog } from './CloneDialog';

const setup = () => {
  const onComplete = jest.fn();
  const parent = fakeReference({ key: 'parent', path: 'parent' });
  const ref = fakeReference({
    parent,
    key: 'to_clone',
    path: 'parent/to_clone',
    data: { bool: true, number: 1234, string: 'a string', json: { a: 'b' } },
  });
  ref.child.mockReturnValue(ref);
  parent.child.mockReturnValue(ref);

  const { getByText, getByLabelText, getByTestId } = render(
    <CloneDialog isOpen={true} onComplete={onComplete} realtimeRef={ref} />
  );
  return { ref, parent, onComplete, getByLabelText, getByText, getByTestId };
};

it('shows a title with the key to clone', async () => {
  const { getByText } = setup();
  await wait();

  expect(getByText(/Clone "to_clone"/)).not.toBeNull();
});

it('defaults the new key field to <key>_copy', async () => {
  const { getByLabelText } = setup();

  await wait();

  expect(getByLabelText(/New key:/).value).toBe('to_clone_copy');
});

it('contains an input and json value for each field', async () => {
  const { getByLabelText } = setup();

  await wait();

  expect(getByLabelText(/bool:/).value).toBe('true');
  expect(getByLabelText(/number:/).value).toBe('1234');
  expect(getByLabelText(/string:/).value).toBe('"a string"');
  expect(getByLabelText(/json:/).value).toBe('{"a":"b"}');
});

it('clones dialog data when the dialog is accepted', async () => {
  const { ref, parent, getByText, getByLabelText } = setup();

  await wait();

  act(() => {
    fireEvent.change(getByLabelText('string:'), {
      target: { value: '"new string"' },
    });
  });

  act(() => {
    fireEvent.change(getByLabelText('number:'), {
      target: { value: '12' },
    });
  });

  act(() => {
    fireEvent.change(getByLabelText('json:'), {
      target: { value: '{"x": "y"}' },
    });
  });

  act(() => {
    fireEvent.submit(getByText('Clone'));
  });

  expect(parent.child).toHaveBeenCalledWith('to_clone_copy');
  expect(ref.set).toHaveBeenCalledWith({
    bool: true,
    number: 12,
    string: 'new string',
    json: { x: 'y' },
  });
});

it('calls onComplete with new key value when accepted', async () => {
  const { getByText, onComplete } = setup();

  await wait();

  act(() => {
    fireEvent.submit(getByText('Clone'));
  });

  expect(onComplete).toHaveBeenCalledWith('to_clone_copy');
});

it('does not set data when the dialog is cancelled', async () => {
  const { ref, getByText } = setup();

  await wait();

  act(() => {
    getByText('Cancel').click();
  });

  expect(ref.set).not.toHaveBeenCalled();
});

it('calls onComplete with undefined when cancelled', async () => {
  const { getByText, onComplete } = setup();

  await wait();

  act(() => getByText('Cancel').click());

  expect(onComplete).toHaveBeenCalledWith();
});
