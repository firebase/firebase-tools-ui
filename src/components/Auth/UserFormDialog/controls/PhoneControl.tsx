import { Typography } from '@rmwc/typography';
import React from 'react';
import { FormContextValues } from 'react-hook-form/dist/contextTypes';

import { Field } from '../../../common/Field';
import { AddAuthUserPayload } from '../../types';
import styles from './controls.module.scss';

// Consistent with the back-end validation. We want to be as loose as possible in
// the emulator to avoid false negatives.
const PHONE_REGEX = /^\+/;

export const PhoneControl: React.FC<FormContextValues<AddAuthUserPayload>> = ({
  register,
  errors,
}) => {
  return (
    <>
      <Typography use="body1" tag="div" className={styles.authKindLabel}>
        Phone authentication
      </Typography>
      <Field
        name="phoneNumber"
        label="Phone"
        placeholder="Enter phone number"
        type="tel"
        inputRef={register({ pattern: PHONE_REGEX })}
      />
      <Typography
        className={styles.error}
        use="body2"
        role="alert"
        theme="error"
      >
        {errors.phoneNumber && 'Phone number must start with a "+"'}
      </Typography>
    </>
  );
};
