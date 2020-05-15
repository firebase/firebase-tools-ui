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
import { MemoryRouter } from 'react-router-dom';

import { fakeReference } from '../testing/models';
import { NodeLeaf } from './NodeLeaf';

const ROOT_REF = fakeReference({ key: null, parent: null });
const REF = fakeReference({
  parent: ROOT_REF,
  key: 'my_key',
  path: 'my_key',
  data: 'my_value',
});

beforeEach(() => {
  REF.toString.mockReturnValue('http://localhost:9000/my_key');

  ROOT_REF.child.mockReturnValue(REF);
  ROOT_REF.toString.mockReturnValue('http://localhost:9000/');
});

describe('the node key', () => {
  it('shows options.databaseURL for root nodes', () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <NodeLeaf realtimeRef={ROOT_REF} value={'my-value'} />
      </MemoryRouter>
    );

    expect(getByLabelText('Key name').textContent).toBe(ROOT_REF.toString());
  });

  it('shows the key for other nodes', () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <NodeLeaf realtimeRef={REF} value={'my-value'} />
      </MemoryRouter>
    );

    expect(getByLabelText('Key name').textContent).toBe(REF.key);
  });
});

describe('the node value', () => {
  it('shows null for root nodes', () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <NodeLeaf realtimeRef={ROOT_REF} value={null} />
      </MemoryRouter>
    );

    expect(getByLabelText('Node value').textContent).toBe('null');
  });

  it('shows the json wrapped value for other nodes', () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <NodeLeaf realtimeRef={REF} value={'my-value'} />
      </MemoryRouter>
    );

    expect(getByLabelText('Node value').textContent).toBe('"my-value"');
  });
});

describe('editing the node', () => {
  describe('root nodes', () => {
    it('shows url as the key, and is disabled', () => {
      const { getByLabelText } = render(
        <MemoryRouter>
          <NodeLeaf realtimeRef={ROOT_REF} value={null} />
        </MemoryRouter>
      );

      act(() => getByLabelText('Edit value').click());

      expect(getByLabelText('Field').value).toBe(ROOT_REF.toString());
    });

    it('has an empty value entry', () => {
      const { getByLabelText } = render(
        <MemoryRouter>
          <NodeLeaf realtimeRef={ROOT_REF} value={null} />
        </MemoryRouter>
      );

      act(() => getByLabelText('Edit value').click());

      expect(getByLabelText('Value').value).toBe('');
    });
  });

  describe('other nodes', () => {
    it('shows url as the key, and is disabled', () => {
      const { getByLabelText } = render(
        <MemoryRouter>
          <NodeLeaf realtimeRef={ROOT_REF} value={null} />
        </MemoryRouter>
      );

      act(() => getByLabelText('Edit value').click());

      expect(getByLabelText('Field').value).toBe(ROOT_REF.toString());
    });

    it('has a value entry box initially', () => {
      const { getByLabelText } = render(
        <MemoryRouter>
          <NodeLeaf realtimeRef={REF} value={'my-value'} />
        </MemoryRouter>
      );

      act(() => getByLabelText('Edit value').click());

      expect(getByLabelText('Value').value).toBe('my-value');
    });
  });
});
