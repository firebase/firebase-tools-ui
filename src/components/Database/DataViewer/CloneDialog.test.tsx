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

import { act, render } from '@testing-library/react';
import React from 'react';

import { fakeReference, fakeSnapshot } from '../testing/models';
import { CloneDialog } from './CloneDialog';

it('shows a title with the key to clone', () => {
  let onComplete = jest.fn();
  const ref = fakeReference({ key: 'to_clone', path: 'a/b/c' });
  const snapshot = fakeSnapshot({
    key: 'to_clone',
    ref,
    data: { a: true, b: 'true' },
  });
  ref.once.mockResolvedValue(snapshot);

  const { getByText, queryByText } = render(
    <CloneDialog isOpen={true} onComplete={onComplete} realtimeRef={ref} />
  );

  expect(getByText(/Clone "to_clone"/)).not.toBeNull();
  // expect(queryByText(/Loading documents/)).toBeNull();
  // expect(getByText(/cool-doc-1/)).not.toBeNull();
});
