/**
 * Copyright 2021 Google LLC
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

import { act, fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithStorage } from '../../testing/renderWithStorage';
import { BucketPicker } from './BucketPicker';

describe('Bucket Picker', () => {
  it('updates the URL with selected bucket', async () => {
    const { getByLabelText, current, defaultBucket } = await renderWithStorage(
      <BucketPicker />
    );

    const select = getByLabelText('Select bucket');

    await act(async () => {
      await fireEvent.change(select, { target: { value: defaultBucket } });
    });

    // This assertion keeps flaking w/ trailing slash
    expect(current.history.location.pathname).toContain(
      `/storage/${defaultBucket}`
    );
  });
});
