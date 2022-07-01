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
  if (!user) {
    return;
  }

  let mfaEnabled: AuthFormUser['mfaEnabled'] = false;
  let mfaPhoneInfo: AuthFormUser['mfaInfo'] = [];
  let emailVerified: AuthFormUser['emailVerified'] = false;

  if (user.mfaInfo) {
    mfaEnabled = true;
    mfaPhoneInfo = user.mfaInfo.map((mfaEnrollment) => ({
      phoneInfo: mfaEnrollment.phoneInfo,
    }));
  }

  if (!!user.emailVerified) {
    emailVerified = true;
  }

  return {
    customAttributes: user.customAttributes,
    displayName: user.displayName,
    photoUrl: user.photoUrl,
    screenName: user.screenName,
    email: user.email,
    password: user.password,
    phoneNumber: user.phoneNumber,
    mfaInfo: user.mfaInfo,
    emailVerified,
    mfaEnabled,
    mfaPhoneInfo,
  };
}

function convertFromFormUser(formUser: AuthFormUser): AddAuthUserPayload {
  let mfaInfo: AddAuthUserPayload['mfaInfo'];
  if (formUser.mfaEnabled) {
    mfaInfo = formUser.mfaPhoneInfo.map((mfaPhoneInfo) => {
      const existingEnrollment = formUser.mfaInfo?.find(
        (mfaEnrollment) => mfaEnrollment.phoneInfo === mfaPhoneInfo.phoneInfo
      );
      return (
        existingEnrollment || {
          ...mfaPhoneInfo,
          enrolledAt: new Date().toISOString(),
          mfaEnrollmentId:
            'AUTH-EMULATOR-UI:' + Math.random().toString(36).substring(5),
        }
      );
    });
  }
  return {
    customAttributes: formUser.customAttributes,
    displayName: formUser.displayName,
    photoUrl: formUser.photoUrl,
    screenName: formUser.screenName,
    email: formUser.email,
    password: formUser.password,
    phoneNumber: formUser.phoneNumber,
    emailVerified: formUser.emailVerified,
    mfaInfo,
  };
}

export type UserFormProps = PropsFromState & PropsFromDispatch;
export const UserForm: React.FC<React.PropsWithChildren<UserFormProps>> = ({
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

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = form;

  // TODO: Should be able to just check isValid, instead of additionally checking
  // that there are no errors. This only happens when `atLeastOneMethodRequired`
  // is the only error present and is causing the "Save" and "Save and create
  // another" buttons to remain enabled even when neither email/password or
  // phone auth are provided. May want to check for any components that are
  // repeatedly getting remounted; perhaps this is the right thread to look at:
  // https://spectrum.chat/react-hook-form/help/should-the-form-isvalid-property-be-false-when-a-required-field-is-empty~c68abcd6-d4c6-4961-9402-7f5d723639fd
  const canSubmit =
    !authUserDialogData?.loading &&
    isValid &&
    Object.values(errors).length === 0;

  const submit = useCallback(
    (formUser: AuthFormUser) => {
      // Take into account multi-field errors.
      if (Object.values(errors).length === 0) {
        save(formUser);
      }
    },
    [errors, save]
  );

  const { ref: displayNameRef, ...displayNameField } = register('displayName');

  return (
    <Dialog renderToPortal open onClose={clearAuthUserDialogData}>
      <DialogTitle>
        {user ? `Edit User ${user.displayName}` : 'Add a user'}
      </DialogTitle>

      <form onSubmit={handleSubmit(submit)} data-testid="user-form">
        <DialogContent>
          <Field
            label="Display name (optional)"
            type="text"
            placeholder="Enter display name"
            error={errors?.displayName && 'Display name is required'}
            inputRef={displayNameRef}
            {...displayNameField}
          />
          <Email {...form} />

          <ImageUrlInput {...form} />
          <CustomAttributes {...form} />
          <SignInMethod {...form} user={user} />
          <MultiFactor {...form} user={user} />
          {hasError(authUserDialogData?.result) && (
            <Callout type="warning">
              <>Error: {authUserDialogData?.result.error}</>
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
