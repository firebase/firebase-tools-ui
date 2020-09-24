import { ListDivider } from '@rmwc/list';
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
  const phoneNumber = watch('phoneNumber');

  useEffect(() => {
    const hasEmailPassword = email !== '' && (password !== '' || isEditing);
    const hasPhone = !!phoneNumber;

    if (hasEmailPassword || hasPhone) {
      // According to docs ClearError should accept arbitrary key
      // to allow cross-field validation, but it's not the case here for some
      // reason.
      clearError(ERROR_CODE as any);
    } else {
      setError(ERROR_CODE as any);
    }
  }, [email, password, clearError, setError, phoneNumber, isEditing]);

  const isTouched =
    formState.touched['email'] ||
    formState.touched['password'] ||
    formState.touched['phoneNumber'];
  const isOnlyError =
    ERROR_CODE in errors && Object.values(errors).length === 1;

  return (
    <div className={styles.signInWrapper}>
      <ListDivider tag="div" />
      <div className={styles.signInHeader}>
        <Typography use="body1">Authentication method</Typography>
        {isTouched && isOnlyError ? (
          <Typography use="body2" theme="error" tag="div" role="alert">
            One method is required. Please enter either an email/password or
            phone number.
          </Typography>
        ) : (
          <Typography use="body2" tag="div">
            Enter details for at least one of the following methods:
          </Typography>
        )}
      </div>
      <EmailPassword {...form} isEditing={isEditing} />
      <PhoneControl {...form} />
      <ListDivider className="bottom-divider" tag="div" />
    </div>
  );
};
