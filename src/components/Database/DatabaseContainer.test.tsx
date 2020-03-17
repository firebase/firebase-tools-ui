import { act, render } from '@testing-library/react';
import React, { useState } from 'react';

import { DatabaseContainer } from './DatabaseContainer';

// TODO: Implement the interaction below.
it.skip('renders prompt to refresh when new dbs are added', async () => {
  let triggerAddDbs: () => void | undefined;
  const DatabasesPickerTest: React.FC = () => {
    const [databases, setDatabases] = useState(['foo', 'bar']);
    triggerAddDbs = () => setDatabases(['foo', 'bar', 'baz']);
    return (
      <DatabaseContainer
        primary="foo"
        current="bar"
        navigation={db => <div data-testid={`nav-${db}`} />}
        fetchDatabases={() => {}}
        databases={databases}
      />
    );
  };
  const { queryByTestId, getByTestId, getByText, queryByText } = render(
    <DatabasesPickerTest />
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
