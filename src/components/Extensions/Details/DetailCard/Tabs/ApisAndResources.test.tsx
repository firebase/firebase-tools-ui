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
import { ApisAndResources } from './ApisAndResources';

describe('ApisAndResources', () => {
  it('renders list of Resources', () => {
    const id = 'pirojok';
    const RESOURCE_NAME = 'pirojok-the-resource';
    const RESOURCE_DESCRIPTION = 'pirojok-the-description';
    const extension: Extension = {
      id,
      resources: [
        {
          name: RESOURCE_NAME,
          description: RESOURCE_DESCRIPTION,
        },
      ],
    } as Extension;

    const { getByText } = render(
      <TestExtensionsProvider extensions={[extension]} instanceId={id}>
        <ApisAndResources />
      </TestExtensionsProvider>
    );

    expect(getByText(new RegExp(RESOURCE_NAME))).not.toBeNull();
    expect(getByText(new RegExp(RESOURCE_DESCRIPTION))).not.toBeNull();
  });

  it('renders list of APIs', () => {
    const id = 'pirojok';
    const API_NAME = 'pirojok-the-api-name';
    const REASON = 'pirojok-the-reason';
    const extension: Extension = {
      id,
      apis: [
        {
          apiName: API_NAME,
          reason: REASON,
        },
      ],
    } as Extension;

    const { getByText } = render(
      <TestExtensionsProvider extensions={[extension]} instanceId={id}>
        <ApisAndResources />
      </TestExtensionsProvider>
    );

    expect(getByText(new RegExp(API_NAME))).not.toBeNull();
    expect(getByText(new RegExp(REASON))).not.toBeNull();
  });
});
