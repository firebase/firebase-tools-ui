import { Portal } from '@rmwc/base';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { AppState } from '../../../store';
import { waitForDialogsToOpen } from '../../../test_utils';
import UsersCard from './UsersCard';

jest.mock('./table/UsersTable');
jest.mock('./header/AuthFilter');

function setup() {
  const store = configureStore<Pick<AppState, 'auth'>>()({
    auth: {
      users: [],
      filter: '',
    },
  });

  return render(
    <>
      <Provider store={store}>
        <Portal />
        <UsersCard />
      </Provider>
    </>
  );
}

describe('UsersCard test', () => {
  it('opens "add user" dialog', async () => {
    const { getByText, queryByRole } = setup();

    // Dialog is closed initially
    expect(queryByRole('alertdialog')).toBeNull();

    fireEvent.click(getByText('Add user'));
    await waitForDialogsToOpen();

    // Dialog is open
    expect(queryByRole('alertdialog')).not.toBeNull();

    // And has appropriate title
    getByText('Add a user', { selector: '.mdc-dialog__title' });
  });

  it('closes "add user" dialog when it calles onclose callback', async () => {
    const { getByText, queryByRole } = setup();

    fireEvent.click(getByText('Add user'));
    await waitForDialogsToOpen();

    fireEvent.click(getByText('Cancel'));
    // Dialog is closed
    expect(queryByRole('alertdialog')).toBeNull();
  });
});
