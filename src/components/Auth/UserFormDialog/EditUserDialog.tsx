import { Dialog, DialogTitle } from '@rmwc/dialog';
import React from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';

import { updateUserRequest } from '../../../store/auth/actions';
import { AuthUser } from '../types';
import UserForm from './UserForm';

export interface EditUserDialogProps {
  user: AuthUser;
  onClose: () => void;
}

type Props = EditUserDialogProps & PropsFromDispatch;

export const EditUserDialog: React.FC<Props> = ({
  onClose,
  user,
  updateUser,
}) => {
  const localId = user.localId;

  return (
    <>
      <Dialog renderToPortal open onClose={onClose}>
        <DialogTitle>Edit User {user.displayName}</DialogTitle>
        <UserForm
          isEditing={true}
          onClose={onClose}
          onSave={user => {
            updateUser({ user, localId });
          }}
          user={user}
        />
      </Dialog>
    </>
  );
};

export interface PropsFromDispatch {
  updateUser: typeof updateUserRequest;
}

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = dispatch => {
  return {
    updateUser: p => {
      return dispatch(updateUserRequest(p));
    },
  };
};

export default connect(null, mapDispatchToProps)(EditUserDialog);
