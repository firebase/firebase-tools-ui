import { Button } from '@rmwc/button';
import { DialogActions, DialogButton, DialogContent } from '@rmwc/dialog';
import React from 'react';
import { useForm } from 'react-hook-form';

import { Field } from '../../common/Field';
import { AddAuthUserPayload } from '../types';
import { CustomAttributes } from './controls/CustomAttributes';
import { EmailPassword } from './controls/EmailPassword';
import { ImageUrlInput } from './controls/ImageUrlInput';
import { PhoneControl } from './controls/PhoneControl';

export interface UserFormProps {
  user?: AddAuthUserPayload;
  onSave: (user: AddAuthUserPayload, localId?: string) => void;
  onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onClose }) => {
  const form = useForm<AddAuthUserPayload>({
    defaultValues: user,
    mode: 'onChange',
  });
  const { register, handleSubmit, formState, reset, errors } = form;
  const canSubmit =
    formState.isValid && Object.values(formState.touched).length > 0;

  const submit = (user: AddAuthUserPayload) => {
    onSave(user);
    onClose();
  };
  return (
    <form onSubmit={handleSubmit(submit)} data-testid="user-form">
      <DialogContent>
        <Field
          name="displayName"
          label="Display name"
          type="text"
          error={errors?.displayName && 'Display name is required'}
          inputRef={register({ required: true })}
        />

        <ImageUrlInput {...form} />
        <EmailPassword {...form} />
        <PhoneControl {...form} />
        <CustomAttributes {...form} />
      </DialogContent>
      <DialogActions>
        <DialogButton action="close" type="button" theme="secondary">
          Cancel
        </DialogButton>
        {!user?.displayName && (
          <Button
            onClick={handleSubmit(result => {
              onSave(result);
              reset(user);
            })}
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
