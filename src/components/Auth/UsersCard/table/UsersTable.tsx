import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableContent,
  DataTableHead,
  DataTableHeadCell,
  DataTableRow,
} from '@rmwc/data-table';
import { IconButton } from '@rmwc/icon-button';
import { MenuItem, SimpleMenu } from '@rmwc/menu';
import React, { useState } from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';

import { createStructuredSelector } from '../../../../store';
import {
  deleteUserRequest,
  setUserDisabledRequest,
} from '../../../../store/auth/actions';
import {
  getFilteredUsers,
  getShowTable,
  getShowZeroResults,
  getShowZeroState,
} from '../../../../store/auth/selectors';
import { AuthUser } from '../../types';
import EditUserDialog from '../../UserFormDialog/EditUserDialog';
import { AuthZeroState } from './AuthZeroState';
import { NoResults } from './NoResults';
import { ProviderCell } from './ProviderCell';

export type UsersTableProps = PropsFromDispatch & PropsFromStore;

interface UserTableRowProps {
  user: AuthUser;
  onEditUser: () => void;
  setUserDisabled: () => void;
  onDeleteUser: () => void;
}

function UsersTableRow({
  user,
  onEditUser,
  setUserDisabled,
  onDeleteUser,
}: UserTableRowProps) {
  /*
   * Simple menu is broken when rendered in portal (it doesn't close)
   *
   * So here we're opening and closing it manually. see:
   * https://github.com/jamesmfriedman/rmwc/issues/627#issuecomment-643238936
   */
  const [menuOpen, setMenuOpen] = useState(false);
  const formattedCreatedAt = new Date(
    Number(user.createdAt)
  ).toLocaleDateString();
  const formattedSignedIn =
    user.signedIn && new Date(Number(user.signedIn)).toLocaleDateString();

  return (
    <DataTableRow>
      <DataTableCell>
        {user.displayName || user.email || user.phone}
      </DataTableCell>
      <DataTableCell>{<ProviderCell user={user} />}</DataTableCell>
      <DataTableCell>{formattedCreatedAt}</DataTableCell>
      <DataTableCell>{formattedSignedIn}</DataTableCell>
      <DataTableCell>{user.localId}</DataTableCell>
      <DataTableCell style={{ width: '20px' }}>
        <SimpleMenu
          open={menuOpen}
          onOpen={() => setMenuOpen(true)}
          onClose={() => setMenuOpen(false)}
          handle={<IconButton icon="more_vert" label="Open menu" />}
          renderToPortal
        >
          <MenuItem
            onClick={() => {
              setMenuOpen(false);
              onEditUser();
            }}
          >
            Edit user
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuOpen(false);
              setUserDisabled();
            }}
          >
            {user.disabled ? 'Enable user' : 'Disable user'}
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuOpen(false);
              onDeleteUser();
            }}
          >
            Delete user
          </MenuItem>
        </SimpleMenu>
      </DataTableCell>
    </DataTableRow>
  );
}

export const UsersTable: React.FC<UsersTableProps> = ({
  filteredUsers,
  setUserDisabled,
  deleteUser,
  shouldShowTable,
  shouldShowZeroResults,
  shouldShowZeroState,
}) => {
  const [userToEdit, setUserToEdit] = useState<AuthUser | undefined>();

  return (
    <>
      <DataTable>
        <DataTableContent>
          <DataTableHead>
            <DataTableRow>
              <DataTableHeadCell>Identifier</DataTableHeadCell>
              <DataTableHeadCell>Provider</DataTableHeadCell>
              <DataTableHeadCell>Created</DataTableHeadCell>
              <DataTableHeadCell>Signed In</DataTableHeadCell>
              <DataTableHeadCell>User UID</DataTableHeadCell>
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>
            {shouldShowTable &&
              filteredUsers.map(user => (
                <UsersTableRow
                  key={user.localId}
                  user={user}
                  onEditUser={() => {
                    setUserToEdit(user);
                  }}
                  setUserDisabled={() => {
                    setUserDisabled({
                      localId: user.localId,
                      disabled: !user.disabled,
                    });
                  }}
                  onDeleteUser={() => {
                    deleteUser(user);
                  }}
                />
              ))}
          </DataTableBody>
        </DataTableContent>
      </DataTable>
      {shouldShowZeroResults && <NoResults />}
      {shouldShowZeroState && <AuthZeroState />}

      {userToEdit && (
        <EditUserDialog
          onClose={() => setUserToEdit(undefined)}
          user={userToEdit}
        />
      )}
    </>
  );
};

export const mapStateToProps = createStructuredSelector({
  shouldShowTable: getShowTable,
  shouldShowZeroResults: getShowZeroResults,
  shouldShowZeroState: getShowZeroState,
  filteredUsers: getFilteredUsers,
});

export type PropsFromStore = ReturnType<typeof mapStateToProps>;

export interface PropsFromDispatch {
  setUserDisabled: typeof setUserDisabledRequest;
  deleteUser: typeof deleteUserRequest;
}

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = dispatch => {
  return {
    setUserDisabled: d => dispatch(setUserDisabledRequest(d)),
    deleteUser: d => dispatch(deleteUserRequest(d)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersTable);
