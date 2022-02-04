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
import { AddAuthUserPayload, AuthFormUser, AuthUser } from '../types';
import { CustomAttributes } from './controls/CustomAttributes';
import Email from './controls/Email';
import { ImageUrlInput } from './controls/ImageUrlInput';
import { MultiFactor } from './controls/MultiFactorAuth';
import { SignInMethod } from './controls/SignInMethod';

function convertToFormUser(user?: AuthUser): AuthFormUser | undefined {
  return (
    user && {
      ...user,
      emailVerified: !!user.emailVerified ? ['on'] : [],
      mfaEnabled: user.mfaInfo ? ['on'] : [],
      mfaPhoneInfo: user.mfaInfo
        ? user.mfaInfo.map((mfaEnrollment) => ({
            phoneInfo: mfaEnrollment.phoneInfo,
          }))
        : [],
    }
  );
}

function convertFromFormUser(formUser: AuthFormUser): AddAuthUserPayload {
  return {
    ...formUser,
    emailVerified: formUser.emailVerified.length > 0 ? true : false,
    // match mfaPhoneInfo array members to an existing enrollment, or create a new enrollment
    mfaInfo: formUser.mfaPhoneInfo
      ? formUser.mfaPhoneInfo.map((mfaPhoneInfo) => {
          const existingEnrollment = formUser.mfaInfo?.find(
            (mfaEnrollment) =>
              mfaEnrollment.phoneInfo === mfaPhoneInfo.phoneInfo
          );
          return (
            existingEnrollment || {
              ...mfaPhoneInfo,
              enrolledAt: new Date().toISOString(),
              mfaEnrollmentId:
                'AUTH-EMULATOR-UI:' + Math.random().toString(36).substring(5),
            }
          );
        })
      : undefined,
  };
}

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

  const formUser = convertToFormUser(user);

  const form = useForm<AuthFormUser>({
    defaultValues: formUser,
    mode: 'onChange',
  });

  const save = useCallback(
    (formUser: AuthFormUser, keepDialogOpen?: boolean) => {
      const user = convertFromFormUser(formUser);
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
    (formUser: AuthFormUser) => {
      // Take into account multi-field errors.
      if (Object.values(errors).length === 0) {
        save(formUser);
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
          <Email {...form} />

          <ImageUrlInput {...form} />
          <CustomAttributes {...form} />
          <SignInMethod {...form} user={user} />
          <MultiFactor {...form} user={user} />
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
              onClick={handleSubmit((result) => {
                save(result, /* keepDialogOpen */ true);
                reset(formUser);
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
> = (dispatch) => {
  return {
    clearAuthUserDialogData: () => dispatch(clearAuthUserDialogData()),
    updateUser: (d) => dispatch(updateUserRequest(d)),
    createUser: (d) => dispatch(createUserRequest(d)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserForm);
