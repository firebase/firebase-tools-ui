import { Portal } from '@rmwc/base';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { AppState } from '../../../store';
import { waitForDialogsToOpen } from '../../../test_utils';
import { OneAccountPerEmailCard } from './OneAccountPerEmailCard';

describe('OneAccountPerEmailCard', () => {
  function setup() {
    const store = configureStore<Pick<AppState, 'auth'>>()({
      auth: {
        users: [],
        filter: '',
        allowDuplicateEmails: false,
      },
    });

    return render(
      <Provider store={store}>
        <Portal />
        <OneAccountPerEmailCard />
      </Provider>
    );
  }

  it('opens the dialog', async () => {
    const { getByText, queryByRole } = setup();

    expect(queryByRole('alertdialog')).toBeNull();
    fireEvent.click(getByText('Change'));
    await waitForDialogsToOpen();
    expect(queryByRole('alertdialog')).not.toBeNull();
  });
});
