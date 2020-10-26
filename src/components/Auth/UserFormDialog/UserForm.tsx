import { Button } from '@rmwc/button';
import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from '@rmwc/dialog';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { MapDispatchToPropsFunction, connect } from 'react-redux';

import { createStructuredSelector } from '../../../store';
import {
  clearAuthUserDialogData,
  createUserRequest,
  updateUserRequest,
} from '../../../store/auth/actions';
import {
  getAuthUserDialog,
  getCurrentEditedUser,
} from '../../../store/auth/selectors';
import { hasError } from '../../../store/utils';
import { Callout } from '../../common/Callout';
import { Field } from '../../common/Field';
import { AddAuthUserPayload } from '../types';
import { CustomAttributes } from './controls/CustomAttributes';
import { ImageUrlInput } from './controls/ImageUrlInput';
import { SignInMethod } from './controls/SignInMethod';

export type UserFormProps = PropsFromState & PropsFromDispatch;
export const UserForm: React.FC<UserFormProps> = ({
  authUserDialogData,
  clearAuthUserDialogData,
  updateUser,
  createUser,
  user,
}) => {
  const isEditing = !!user;
  const localId = user?.localId!;

  const form = useForm<AddAuthUserPayload>({
    defaultValues: user,
    mode: 'onChange',
  });

  const save = useCallback(
    (user: AddAuthUserPayload, keepDialogOpen?: boolean) => {
      if (isEditing) {
        updateUser({ user, localId });
      } else {
        createUser({ user, keepDialogOpen });
      }
    },
    [isEditing, updateUser, createUser, localId]
  );

  const { register, handleSubmit, formState, reset, errors } = form;

  const canSubmit = !authUserDialogData?.loading && formState.isValid;

  const submit = useCallback(
    (user: AddAuthUserPayload) => {
      // Take into account multi-field errors.
      if (Object.values(errors).length === 0) {
        save(user);
      }
    },
    [errors, save]
  );

  return (
    <Dialog renderToPortal open onClose={clearAuthUserDialogData}>
      <DialogTitle>
        {user ? `Edit User ${user.displayName}` : 'Add a user'}
      </DialogTitle>

      <form onSubmit={handleSubmit(submit)} data-testid="user-form">
        <DialogContent>
          <Field
            name="displayName"
            label="Display name (optional)"
            type="text"
            placeholder="Enter display name"
            error={errors?.displayName && 'Display name is required'}
            inputRef={register({})}
          />

          <ImageUrlInput {...form} />
          <CustomAttributes {...form} />
          <SignInMethod {...form} user={user} />
          {hasError(authUserDialogData?.result) && (
            <Callout type="warning">
              Error: {authUserDialogData?.result.error}
            </Callout>
          )}
        </DialogContent>
        <DialogActions>
          <DialogButton action="close" type="button" theme="secondary">
            Cancel
          </DialogButton>
          {!isEditing && (
            <Button
              onClick={handleSubmit(result => {
                save(result, /* keepDialogOpen */ true);
                reset(user);
              })}
              disabled={!canSubmit}
              type="button"
            >
              Save and create another
            </Button>
          )}

          <DialogButton disabled={!canSubmit} type="submit" unelevated>
            Save
          </DialogButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export interface PropsFromDispatch {
  clearAuthUserDialogData: typeof clearAuthUserDialogData;
  updateUser: typeof updateUserRequest;
  createUser: typeof createUserRequest;
}

export const mapStateToProps = createStructuredSelector({
  authUserDialogData: getAuthUserDialog,
  user: getCurrentEditedUser,
});
export type PropsFromState = ReturnType<typeof mapStateToProps>;

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = dispatch => {
  return {
    clearAuthUserDialogData: () => dispatch(clearAuthUserDialogData()),
    updateUser: d => dispatch(updateUserRequest(d)),
    createUser: d => dispatch(createUserRequest(d)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserForm);
