import { Button } from '@rmwc/button';
import { DialogActions, DialogButton, DialogContent } from '@rmwc/dialog';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { Field } from '../../common/Field';
import { AddAuthUserPayload } from '../types';
import { CustomAttributes } from './controls/CustomAttributes';
import { ImageUrlInput } from './controls/ImageUrlInput';
import { SignInMethod } from './controls/SignInMethod';

export interface UserFormProps {
  user?: AddAuthUserPayload;
  onSave: (user: AddAuthUserPayload, localId?: string) => void;
  onClose: () => void;
  isEditing: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSave,
  onClose,
  isEditing,
}) => {
  const form = useForm<AddAuthUserPayload>({
    defaultValues: user,
    mode: 'onChange',
  });
  const { register, handleSubmit, formState, reset, errors } = form;
  const canSubmit =
    formState.isValid && Object.values(formState.touched).length > 0;

  const submit = useCallback(
    (user: AddAuthUserPayload) => {
      // Take into account multi-field errors.
      if (Object.values(errors).length === 0) {
        onSave(user);
        onClose();
      }
    },
    [errors, onSave, onClose]
  );

  return (
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
        <SignInMethod {...form} user={user}></SignInMethod>
      </DialogContent>
      <DialogActions>
        <DialogButton action="close" type="button" theme="secondary">
          Cancel
        </DialogButton>
        {!isEditing && (
          <Button
            onClick={handleSubmit(result => {
              onSave(result);
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
  );
};

export default UserForm;
