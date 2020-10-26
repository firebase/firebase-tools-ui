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
  openAuthUserDialog,
  setUserDisabledRequest,
} from '../../../../store/auth/actions';
import {
  getFilteredUsers,
  getShowTable,
  getShowZeroResults,
  getShowZeroState,
} from '../../../../store/auth/selectors';
import { RemoteResult, createRemoteDataLoaded } from '../../../../store/utils';
import { AuthUser } from '../../types';
import { AuthZeroState } from './AuthZeroState';
import { confirmDeleteUser } from './confirmDeleteUser';
import { NoResults } from './NoResults';
import { ProviderCell } from './ProviderCell';
import styles from './UsersTable.module.scss';

export type UsersTableProps = PropsFromDispatch & PropsFromStore;

interface UserTableRowProps {
  user: AuthUser;
  onEditUser: () => void;
  toggleUserDisabled: () => void;
  onDeleteUser: () => void;
}

export const UsersTableRow: React.FC<UserTableRowProps> = ({
  user,
  onEditUser,
  toggleUserDisabled,
  onDeleteUser,
}) => {
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
    user.lastLoginAt && new Date(Number(user.lastLoginAt)).toLocaleDateString();

  return (
    <DataTableRow className={user.disabled ? styles.disabled : ''}>
      <DataTableCell>
        {user.displayName || user.email || user.phoneNumber}
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
          handle={
            <IconButton theme="secondary" icon="more_vert" label="Open menu" />
          }
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
              toggleUserDisabled();
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
};

export const UsersTable: React.FC<UsersTableProps> = ({
  filteredUsers,
  setUserDisabled,
  deleteUser,
  shouldShowTable,
  openAuthUserDialog,
  shouldShowZeroResults,
  shouldShowZeroState,
}) => {
  return (
    <>
      <DataTable className={styles.tableWrapper}>
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
                    openAuthUserDialog(createRemoteDataLoaded(user));
                  }}
                  toggleUserDisabled={() => {
                    setUserDisabled({
                      localId: user.localId,
                      disabled: !user.disabled,
                    });
                  }}
                  onDeleteUser={async () => {
                    if (await confirmDeleteUser(user)) {
                      deleteUser(user);
                    }
                  }}
                />
              ))}
          </DataTableBody>
        </DataTableContent>
      </DataTable>
      {shouldShowZeroResults && <NoResults />}
      {shouldShowZeroState && <AuthZeroState />}
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
  openAuthUserDialog: typeof openAuthUserDialog;
}

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = dispatch => {
  return {
    setUserDisabled: d => dispatch(setUserDisabledRequest(d)),
    deleteUser: d => dispatch(deleteUserRequest(d)),
    openAuthUserDialog: (data: RemoteResult<AuthUser | undefined>) =>
      dispatch(openAuthUserDialog(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersTable);
