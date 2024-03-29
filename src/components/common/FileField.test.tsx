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

import { render } from '@testing-library/react';
import React from 'react';

import { FileField } from './FileField';

describe('<FileField>', () => {
  it('renders given label', () => {
    const { getByText } = render(<FileField label="My label" />);

    expect(getByText('My label')).not.toBeNull();
  });

  it('renders the value if provided', () => {
    const { getByText } = render(
      <FileField label="My label" value="filename.json" onFiles={jest.fn()} />
    );

    expect(getByText('filename.json')).not.toBeNull();
  });

  it('shows a tip below', () => {
    const { getByText } = render(<FileField label="My label" tip="A tip!" />);

    expect(getByText('A tip!')).not.toBeNull();
  });

  it('shows an error instead of the tip', () => {
    const { getByText, queryByText } = render(
      <FileField label="My label" tip="A tip!" error="Missing!" />
    );

    expect(queryByText('A tip!')).toBeNull();
    expect(getByText('Missing!')).not.toBeNull();
  });
});
