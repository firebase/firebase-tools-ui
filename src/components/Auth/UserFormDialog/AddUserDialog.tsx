import { Dialog, DialogTitle } from '@rmwc/dialog';
import React from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';

import { createUserRequest } from '../../../store/auth/actions';
import { AddAuthUserPayload } from '../types';
import UserForm from './UserForm';

export interface AddUserDialogProps {
  onClose: () => void;
}

type Props = AddUserDialogProps & PropsFromDispatch;

export const AddUserDialog: React.FC<Props> = ({ onClose, createUser }) => {
  // Pre-populate custom attributes to always have one field displayed.
  const user: AddAuthUserPayload = {
    displayName: '',
  };

  return (
    <>
      <Dialog renderToPortal open onClose={onClose}>
        <DialogTitle>Add a user</DialogTitle>
        <UserForm
          isEditing={false}
          onClose={onClose}
          user={user}
          onSave={user => {
            createUser({ user });
          }}
        />
      </Dialog>
    </>
  );
};

export interface PropsFromDispatch {
  createUser: typeof createUserRequest;
}

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = dispatch => {
  return {
    createUser: p => dispatch(createUserRequest(p)),
  };
};

export default connect(null, mapDispatchToProps)(AddUserDialog);
