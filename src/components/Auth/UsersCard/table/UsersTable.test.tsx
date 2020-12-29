import { Portal } from '@rmwc/base';
import { fireEvent, render, waitForElement } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';

import { createRemoteDataLoaded } from '../../../../store/utils';
import { delay } from '../../../../test_utils';
import { createFakeUser, getMockAuthStore } from '../../test_utils';
import { confirmDeleteUser } from './confirmDeleteUser';
import { UsersTable, UsersTableProps } from './UsersTable';

jest.mock('./confirmDeleteUser');

const fakeUser1 = createFakeUser({
  localId: 'pirojok',
  displayName: 'Pirojok',
});

const fakeUser2 = createFakeUser({
  localId: 'pelmeni',
  displayName: 'Pelmeni',
});

describe('UserTable', () => {
  function setup(customProps?: Partial<UsersTableProps>) {
    const store = getMockAuthStore();

    const props = {
      filteredUsers: [],
      shouldShowTable: true,
      shouldShowZeroResults: false,
      shouldShowZeroState: false,
      setUserDisabled: jest.fn(),
      openAuthUserDialog: jest.fn(),
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

      // Keeps the header
      expect(getAllByRole('row').length).toBe(1);
      getByText('No results');
    });

    it('displays zero-state', () => {
      const { getAllByRole, getByText } = setup({
        filteredUsers: [],
        shouldShowTable: false,
        shouldShowZeroState: true,
      });

      // Keeps the header
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

      // TODO: Investigate the best way to wait for menu to fully open.
      await act(() => delay(200));

      const button = result.getByRole('menuitem', {
        name: text,
      });

      return { ...result, button };
    }

    it('edits user', async () => {
      const { button, openAuthUserDialog } = await getMenuItemByText(
        'Edit user'
      );
      await act(async () => {
        fireEvent.click(button);
      });

      expect(openAuthUserDialog).toHaveBeenCalledWith(
        createRemoteDataLoaded(fakeUser1)
      );
    });

    it('deletes user', async () => {
      const { button, deleteUser } = await getMenuItemByText('Delete user');

      (confirmDeleteUser as jest.Mock).mockImplementation(() =>
        Promise.resolve(true)
      );

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
