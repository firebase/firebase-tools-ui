import { Portal } from '@rmwc/base';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { AppState } from '../../../store';
import { openAuthUserDialog } from '../../../store/auth/actions';
import { createRemoteDataLoaded } from '../../../store/utils';
import { waitForDialogsToOpen } from '../../../test_utils';
import { createFakeAuthStateWithUsers } from '../test_utils';
import { UserCardProps, UsersCard } from './UsersCard';

jest.mock('./table/UsersTable', () => () => null);
jest.mock('./header/AuthFilter', () => () => null);

function setup(props: Partial<UserCardProps>) {
  const store = configureStore<Pick<AppState, 'auth'>>()({
    auth: createFakeAuthStateWithUsers([]),
  });

  const openAuthUserDialog = jest.fn();
  const allProps = {
    openAuthUserDialog,
    authUserDialogData: undefined,
    ...props,
  };

  return {
    openAuthUserDialog,
    ...render(
      <>
        <Provider store={store}>
          <Portal />
          <UsersCard {...allProps} />
        </Provider>
      </>
    ),
  };
}

describe('UsersCard test', () => {
  it('opens "add user" dialog', async () => {
    const { getByText, queryByRole } = setup({
      authUserDialogData: createRemoteDataLoaded(undefined),
    });

    await waitForDialogsToOpen();

    // Dialog is open
    expect(queryByRole('alertdialog')).not.toBeNull();

    // And has appropriate title
    getByText('Add a user', { selector: '.mdc-dialog__title' });
  });

  it('Triggers appropriate action on "add user" click', async () => {
    const { getByText, openAuthUserDialog } = setup({
      authUserDialogData: undefined,
    });

    fireEvent.click(getByText('Add user'));

    expect(openAuthUserDialog).toHaveBeenCalled();
  });

  it('closes "add user" dialog when it calls onclose callback', async () => {
    const { queryByRole } = setup({
      authUserDialogData: undefined,
    });

    // Dialog is closed
    expect(queryByRole('alertdialog')).toBeNull();
  });
});
