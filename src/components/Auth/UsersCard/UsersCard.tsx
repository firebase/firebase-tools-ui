import { Card } from '@rmwc/card';
import React from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';

import { createStructuredSelector } from '../../../store';
import { setAuthUserDialogData } from '../../../store/auth/actions';
import { getAuthUserDialog } from '../../../store/auth/selectors';
import { RemoteResult, createRemoteDataLoaded } from '../../../store/utils';
import { AuthUser } from '../types';
import UserForm from '../UserFormDialog/UserForm';
import { AuthHeader } from './header/AuthHeader';
import UsersTable from './table/UsersTable';

export type UserCardProps = PropsFromDispatch & PropsFromState;
export const UsersCard: React.FC<UserCardProps> = ({
  setAuthUserDialogData,
  authUserDialogData,
}) => {
  return (
    <Card>
      <AuthHeader
        onOpenNewUserDialog={() =>
          setAuthUserDialogData(createRemoteDataLoaded(undefined))
        }
      />
      <UsersTable />
      {authUserDialogData && <UserForm />}
    </Card>
  );
};

export interface PropsFromDispatch {
  setAuthUserDialogData: typeof setAuthUserDialogData;
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
    setAuthUserDialogData: (data: RemoteResult<AuthUser | undefined>) =>
      dispatch(setAuthUserDialogData(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersCard);
