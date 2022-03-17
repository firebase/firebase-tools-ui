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
  const AUTHOR_NAME = 'pirojok-the-author';

  function setup(extension: Extension) {
    return render(
      <TestExtensionsProvider
        extensions={[extension]}
        instanceId={extension.id}
      >
        <RelatedLinks />
      </TestExtensionsProvider>
    );
  }

  it('renders list of related links', () => {
    const extension: Extension = {
      id: 'pirojok',
      authorName: AUTHOR_NAME,
      extensionDetailsUrl: 'detail.url',
      authorUrl: 'author.url',
    } as Extension;
    const { getByText } = setup(extension);
    expect(getByText('Source code')).not.toBeNull();
    expect(getByText('Extension details')).not.toBeNull();
    expect(getByText(AUTHOR_NAME)).not.toBeNull();
  });

  it('hides extension details if URL not present', async () => {
    const extension: Extension = {
      id: 'pirojok',
      authorName: AUTHOR_NAME,
    } as Extension;
    const { queryByText } = setup(extension);
    expect(queryByText('Extension details')).toBeNull();
  });
});
