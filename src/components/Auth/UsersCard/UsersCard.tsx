/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
> = (dispatch) => {
  return {
    openAuthUserDialog: (data: RemoteResult<AuthUser | undefined>) =>
      dispatch(openAuthUserDialog(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersCard);
