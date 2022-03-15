/**
 * Copyright 2022 Google LLC
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

import { Extension } from '../../../models';
import { TestExtensionsProvider } from '../../../testing/TestExtensionsProvider';
import { RelatedLinks } from './RelatedLinks';

describe('RelatedLinks', () => {
  it('renders list of related links', () => {
    const AUTHOR_NAME = 'pirojok-the-author';
    const extension: Extension = {
      id: 'pirojok',
      authorName: AUTHOR_NAME,
    } as Extension;

    const { getByText } = render(
      <TestExtensionsProvider extensions={[]}>
        <RelatedLinks extension={extension} />
      </TestExtensionsProvider>
    );
    expect(getByText('Extension details')).not.toBeNull();
    expect(getByText('Source code')).not.toBeNull();
    expect(getByText(AUTHOR_NAME)).not.toBeNull();
  });
});
