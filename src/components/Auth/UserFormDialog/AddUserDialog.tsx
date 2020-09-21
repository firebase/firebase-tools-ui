import { Dialog, DialogTitle } from '@rmwc/dialog';
import React from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';

import { addUser } from '../../../store/auth/actions';
import { AddAuthUserPayload } from '../types';
import UserForm from './UserForm';

export interface AddUserDialogProps {
  onClose: () => void;
}

type Props = AddUserDialogProps & PropsFromDispatch;

export const AddUserDialog: React.FC<Props> = ({ onClose, addUser }) => {
  // Pre-populate custom attributes to always have one field displayed.
  const user: AddAuthUserPayload = {
    displayName: '',
    customAttributes: [{ role: '', value: '' }],
  };

  return (
    <>
      <Dialog renderToPortal open onClose={onClose}>
        <DialogTitle>Add user</DialogTitle>
        <UserForm
          onClose={onClose}
          user={user}
          onSave={user => {
            addUser({ user });
          }}
        />
      </Dialog>
    </>
  );
};

export interface PropsFromDispatch {
  addUser: typeof addUser;
}

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = dispatch => {
  return {
    addUser: p => dispatch(addUser(p)),
  };
};

export default connect(null, mapDispatchToProps)(AddUserDialog);
