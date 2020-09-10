import { Typography } from '@rmwc/typography';
import React, { useEffect } from 'react';
import { FormContextValues } from 'react-hook-form/dist/contextTypes';

import { AddAuthUserPayload } from '../../types';
import styles from './controls.module.scss';
import { EmailPassword } from './EmailPassword';
import { PhoneControl } from './PhoneControl';

const ERROR_CODE = 'atLeastOneMethodRequired';

export type SignInMethodProps = FormContextValues<AddAuthUserPayload> & {
  isEditing: boolean;
};
export const SignInMethod: React.FC<SignInMethodProps> = form => {
  const { watch, setError, clearError, formState, errors, isEditing } = form;
  const email = watch('email');
  const password = watch('password');
  const phone = watch('phone');

  useEffect(() => {
    const hasEmailPassword = email !== '' && (password !== '' || isEditing);
    const hasPhone = !!phone;

    if (hasEmailPassword || hasPhone) {
      clearError(ERROR_CODE);
    } else {
      setError(ERROR_CODE, 'both');
    }
  }, [email, password, clearError, setError, phone, isEditing]);

  const isTouched =
    formState.touched['email'] ||
    formState.touched['password'] ||
    formState.touched['phone'];
  const isOnlyError =
    ERROR_CODE in errors && Object.values(errors).length === 1;

  return (
    <>
      <div className={styles.signInHeader}>
        <Typography use="subtitle2">Sign-in method</Typography>
        {isTouched && isOnlyError ? (
          <Typography use="body2" theme="error" tag="div" role="alert">
            One method is required. Please enter either a email/password or
            phone number.
          </Typography>
        ) : (
          <Typography use="body2" tag="div">
            Choose at least one method
          </Typography>
        )}
      </div>
      <EmailPassword {...form} isEditing={isEditing} />
      <PhoneControl {...form} />
    </>
  );
};
