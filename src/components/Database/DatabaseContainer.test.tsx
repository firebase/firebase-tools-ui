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

import { act, render } from '@testing-library/react';
import React, { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { DatabaseContainer } from './DatabaseContainer';

it('renders prompt to refresh when new dbs are added', async () => {
  let triggerAddDbs: () => void | undefined;
  const DatabasesPickerTest: React.FC = () => {
    const [databases, setDatabases] = useState(['foo', 'bar']);
    triggerAddDbs = () => setDatabases(['foo', 'bar', 'baz']);
    return (
      <DatabaseContainer
        primary="foo"
        current="bar"
        navigation={(db) => `/nav/${db}`}
        databasesSubscribe={() => {}}
        databasesUnsubscribe={() => {}}
        databases={databases}
      />
    );
  };
  const { queryByTestId, getByTestId, getByText, queryByText } = render(
    <MemoryRouter>
      <DatabasesPickerTest />
    </MemoryRouter>
  );

  act(triggerAddDbs!);

  expect(queryByTestId('nav-baz')).toBeNull(); // Not displayed yet.
  // Instead, a prompt to reload should be shown.
  expect(getByText(/new databases/)).not.toBeNull();
  const reloadButton = getByText('Reload');
  expect(reloadButton).not.toBeNull();

  act(() => reloadButton.click());

  expect(getByTestId('nav-foo')).not.toBeNull();
  expect(getByTestId('nav-bar')).not.toBeNull();
  expect(getByTestId('nav-baz')).not.toBeNull();
  expect(queryByText(/new databases/)).toBeNull(); // No prompt any more.
});
