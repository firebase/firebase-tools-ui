import { Card } from '@rmwc/card';
import React from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';

import { createStructuredSelector } from '../../../store';
import { openAuthUserDialog } from '../../../store/auth/actions';
import { getAuthUserDialog } from '../../../store/auth/selectors';
import { RemoteResult, createRemoteDataLoaded } from '../../../store/utils';
import { AuthUser } from '../types';
import UserForm from '../UserFormDialog/UserForm';
import { AuthHeader } from './header/AuthHeader';
import UsersTable from './table/UsersTable';

export type UserCardProps = PropsFromDispatch & PropsFromState;
export const UsersCard: React.FC<UserCardProps> = ({
  openAuthUserDialog,
  authUserDialogData,
}) => {
  return (
    <Card>
      <AuthHeader
        onOpenNewUserDialog={() =>
          openAuthUserDialog(createRemoteDataLoaded(undefined))
        }
      />
      <UsersTable />
      {authUserDialogData && <UserForm />}
    </Card>
  );
};

export interface PropsFromDispatch {
  openAuthUserDialog: typeof openAuthUserDialog;
}

export const mapStateToProps = createStructuredSelector({
  authUserDialogData: getAuthUserDialog,
});
export type PropsFromState = ReturnType<typeof mapStateToProps>;

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = dispatch => {
  return {
    openAuthUserDialog: (data: RemoteResult<AuthUser | undefined>) =>
      dispatch(openAuthUserDialog(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersCard);
