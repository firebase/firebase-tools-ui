import { Portal } from '@rmwc/base';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { AppState } from '../../../../store';
import {
  waitForDialogsToOpen,
  waitForMenuToOpen,
} from '../../../../test_utils';
import { UsersTable, UsersTableProps } from './UsersTable';

const fakeUser1 = {
  localId: 'pirojok',
  disabled: false,
  displayName: 'Pirojok',
  createdAt: new Date(),
};

const fakeUser2 = {
  localId: 'pelmeni',
  disabled: false,
  displayName: 'Pelmeni',
  createdAt: new Date(),
};

describe('AuthTable text', () => {
  function setup(customProps?: Partial<UsersTableProps>) {
    const store = configureStore<Pick<AppState, 'auth'>>()({
      auth: {
        users: [],
        filter: '',
        allowDuplicateEmails: false,
      },
    });

    const props = {
      filteredUsers: [],
      shouldShowTable: true,
      shouldShowZeroResults: false,
      shouldShowZeroState: false,
      setUserDisabled: jest.fn(),
      deleteUser: jest.fn(),
      ...customProps,
    };

    const methods = render(
      <>
        <Portal />
        <Provider store={store}>
          <UsersTable {...props} />
        </Provider>
      </>
    );

    return {
      ...methods,
      ...props,
    };
  }

  describe('table', () => {
    it('renders header row when there are no users', () => {
      const { getAllByRole } = setup();
      expect(getAllByRole('row').length).toBe(1);
    });

    it('renders appropriate number of rows when there are users', () => {
      const { getAllByRole, queryByText } = setup({
        filteredUsers: [fakeUser1, fakeUser2],
      });

      expect(getAllByRole('row').length).toBe(3);
      expect(queryByText('No results')).toBeNull();
    });

    it('displays no-users message', () => {
      const { getAllByRole, getByText } = setup({
        filteredUsers: [],
        shouldShowTable: false,
        shouldShowZeroResults: true,
      });

      // Keeps displaying header
      expect(getAllByRole('row').length).toBe(1);
      getByText('No results');
    });

    it('displays zero-state', () => {
      const { getAllByRole, getByText } = setup({
        filteredUsers: [],
        shouldShowTable: false,
        shouldShowZeroState: true,
      });

      // Keeps displaying header
      expect(getAllByRole('row').length).toBe(1);
      getByText(/No users/);
    });
  });

  describe('actions', () => {
    async function getMenuItemByText(text: string) {
      const result = setup({
        filteredUsers: [fakeUser1, fakeUser2],
      });

      const menu = result.getAllByLabelText('Open menu')[0];

      await act(async () => {
        fireEvent.click(menu);
      });

      await waitForMenuToOpen();

      const button = result.getByText(text, {
        selector: '.mdc-menu-surface--open .mdc-list-item',
      });

      return { ...result, button };
    }

    it('edits user', async () => {
      const { button, queryByRole, getByText } = await getMenuItemByText(
        'Edit user'
      );
      await act(async () => {
        fireEvent.click(button);
      });

      await waitForDialogsToOpen();

      // Dialog is open
      expect(queryByRole('alertdialog')).not.toBeNull();

      // And has appropriate title
      getByText('Edit User Pirojok', { selector: '.mdc-dialog__title' });
    });

    it('deletes user', async () => {
      const { button, deleteUser } = await getMenuItemByText('Delete user');

      await act(async () => {
        fireEvent.click(button);
      });

      expect(deleteUser).toHaveBeenCalledWith(fakeUser1);
    });

    it('disables user', async () => {
      const { button, setUserDisabled } = await getMenuItemByText(
        'Disable user'
      );

      await act(async () => {
        fireEvent.click(button);
      });

      expect(setUserDisabled).toHaveBeenCalledWith({
        disabled: true,
        localId: fakeUser1.localId,
      });
    });
  });
});
