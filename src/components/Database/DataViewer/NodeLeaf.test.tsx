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

import { act } from '@testing-library/react';
import { ref } from 'firebase/database';
import React from 'react';

import { renderWithDatabase } from '../testing/DatabaseTestProviders';
import { NodeLeaf } from './NodeLeaf';

describe('the node key', () => {
  it('shows options.databaseURL for root nodes', async () => {
    const { getByLabelText } = await renderWithDatabase((db) => {
      const dbRef = ref(db, 'foo');
      return Promise.resolve(
        <NodeLeaf realtimeRef={dbRef} value={'my-value'} />
      );
    });

    expect(getByLabelText('Key name').textContent).toMatch('foo');
  });

  it('shows the key for other nodes', async () => {
    const { getByLabelText } = await renderWithDatabase((db) => {
      const dbRef = ref(db, 'foo/bar/baz');

      return Promise.resolve(
        <NodeLeaf realtimeRef={dbRef} value={'my-value'} />
      );
    });

    expect(getByLabelText('Key name').textContent).toBe('baz');
  });
});

describe('the node value', () => {
  it('shows null for root nodes', async () => {
    const { getByLabelText } = await renderWithDatabase((db) =>
      Promise.resolve(<NodeLeaf realtimeRef={ref(db)} value={null} />)
    );

    expect(getByLabelText('Node value').textContent).toBe('null');
  });

  it('shows the json wrapped value for other nodes', async () => {
    const { getByLabelText } = await renderWithDatabase((db) =>
      Promise.resolve(<NodeLeaf realtimeRef={ref(db)} value={'my-value'} />)
    );

    expect(getByLabelText('Node value').textContent).toBe('"my-value"');
  });
});

describe('editing the node', () => {
  describe('root nodes', () => {
    it('shows url as the key, and is disabled', async () => {
      const { getByLabelText } = await renderWithDatabase((db) =>
        Promise.resolve(<NodeLeaf realtimeRef={ref(db)} value={null} />)
      );

      act(() => getByLabelText('Edit value for: null').click());

      expect((getByLabelText('Field') as HTMLInputElement).value).toMatch(
        /^http:\/\/(localhost|127.0.0.1)/
      );
    });

    it('has an empty value entry', async () => {
      const { getByLabelText } = await renderWithDatabase((db) =>
        Promise.resolve(<NodeLeaf realtimeRef={ref(db)} value={null} />)
      );

      act(() => getByLabelText('Edit value for: null').click());

      expect((getByLabelText('Value') as HTMLInputElement).value).toBe('');
    });
  });

  describe('other nodes', () => {
    it('shows url as the key, and is disabled', async () => {
      const { getByLabelText } = await renderWithDatabase((db) =>
        Promise.resolve(<NodeLeaf realtimeRef={ref(db)} value={null} />)
      );

      act(() => getByLabelText('Edit value for: null').click());

      expect((getByLabelText('Field') as HTMLInputElement).value).toMatch(
        /^http:\/\/(localhost|127.0.0.1)/
      );
    });

    it('has a value entry box initially', async () => {
      const { getByLabelText } = await renderWithDatabase((db) =>
        Promise.resolve(
          <NodeLeaf realtimeRef={ref(db, 'foo')} value={'my-value'} />
        )
      );

      act(() => getByLabelText('Edit value for: "foo"').click());

      expect((getByLabelText('Value') as HTMLInputElement).value).toBe(
        'my-value'
      );
    });
  });
});
