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
import { deleteUser, setUserDisabled } from '../../../../store/auth/actions';
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

export type UsersTableProps = PropsFromDispatch & PropsFromStore;

interface UserTableRowProps {
  user: AuthUser;
  onEditUser: () => void;
  onSetUserEnabled: () => void;
  onDeleteUser: () => void;
}

function UsersTableRow(props: UserTableRowProps) {
  return (
    <DataTableRow>
      <DataTableCell>{props.user.displayName}</DataTableCell>
      <DataTableCell>Value</DataTableCell>
      <DataTableCell>
        {props.user.createdAt.toString().substr(0, 10)}
      </DataTableCell>
      <DataTableCell>
        {props.user.signedIn && props.user.signedIn.toString()}
      </DataTableCell>
      <DataTableCell>{props.user.localId}</DataTableCell>
      <DataTableCell>
        {/*
         * TODO(kirjs): This menu doesn't close.
         * I'm going to fix this last moment if it doesn't fix itself.
         * See https://github.com/jamesmfriedman/rmwc/issues/627
         */}
        <SimpleMenu
          handle={<IconButton icon="more_vert" label="Open menu" />}
          renderToPortal
        >
          <MenuItem onClick={props.onEditUser}>Edit user</MenuItem>
          <MenuItem onClick={props.onSetUserEnabled}>
            {props.user.disabled ? 'Enable user' : 'Disable user'}
          </MenuItem>
          <MenuItem onClick={props.onDeleteUser}>Delete user</MenuItem>
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
                  onSetUserEnabled={() => {
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
  setUserDisabled: typeof setUserDisabled;
  deleteUser: typeof deleteUser;
}

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = dispatch => {
  return {
    setUserDisabled: d => dispatch(setUserDisabled(d)),
    deleteUser: d => dispatch(deleteUser(d)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersTable);
