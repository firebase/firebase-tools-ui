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

import { act, render } from '@testing-library/react';
import React from 'react';

import { Extension } from '../../../models';
import { TestExtensionsProvider } from '../../../testing/TestExtensionsProvider';
import ParamList from './ParamList';

describe('ParamList', () => {
  const id = 'pirojok';
  const DESCRIPTION = 'pirojok-the-description';
  const PARAM = 'pirojok-the-param';
  const LABEL = 'pirojok-the-label';
  const VALUE = 'pirojok-the-value';
  const staticExtension: Extension = {
    id,
    params: [
      {
        param: PARAM,
        label: LABEL,
        value: VALUE,
        description: DESCRIPTION,
      },
    ],
  } as Extension;

  const dynId = 'dyn-pirojok';
  const DYN_DESCRIPTION = 'dyn-pirojok-the-description';
  const DYN_PARAM = 'dyn-pirojok-the-param';
  const DYN_LABEL = 'dyn-pirojok-the-label';
  const DYN_VALUE = 'dyn-pirojok-the-value';
  const LABELS: Record<string, string> = {
    createdBy: 'SDK',
    codebase: 'default',
  };
  const dynamicExtension: Extension = {
    id: dynId,
    params: [
      {
        param: DYN_PARAM,
        label: DYN_LABEL,
        value: DYN_VALUE,
        description: DYN_DESCRIPTION,
      },
    ],
    labels: LABELS,
  } as Extension;

  function setup(extension: Extension, id: string) {
    return render(
      <TestExtensionsProvider extensions={[extension]} instanceId={id}>
        <ParamList />
      </TestExtensionsProvider>
    );
  }

  it('renders list of parameters for static extensions', () => {
    const { getByText } = setup(staticExtension, id);

    expect(getByText(new RegExp(LABEL))).not.toBeNull();
    expect(getByText(new RegExp(VALUE))).not.toBeNull();
  });

  it('renders list of parameters for dynamic extensions', () => {
    const { getByText } = setup(dynamicExtension, dynId);

    expect(getByText(new RegExp(DYN_LABEL))).not.toBeNull();
    expect(getByText(new RegExp(DYN_VALUE))).not.toBeNull();
  });

  it('displays param description on expansion in markdown for static', () => {
    const { getByText } = setup(staticExtension, id);

    act(() => {
      getByText(new RegExp(LABEL)).click();
    });
    expect(getByText(new RegExp(DESCRIPTION))).not.toBeNull();
    expect(getByText(new RegExp(DESCRIPTION))).not.toBeNull();
  });

  it('displays param description on expansion in markdown for dynamic', () => {
    const { getByText } = setup(dynamicExtension, dynId);

    act(() => {
      getByText(new RegExp(DYN_LABEL)).click();
    });
    expect(getByText(new RegExp(DYN_DESCRIPTION))).not.toBeNull();
  });
});
