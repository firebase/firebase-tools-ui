import { Typography } from '@rmwc/typography';
import React from 'react';
import { FormContextValues } from 'react-hook-form/dist/contextTypes';
import { connect } from 'react-redux';

import { createStructuredSelector } from '../../../../store';
import { getAllPhoneNumbers } from '../../../../store/auth/selectors';
import { Field } from '../../../common/Field';
import { AddAuthUserPayload } from '../../types';
import styles from './controls.module.scss';

// Consistent with the back-end validation. We want to be as loose as possible in
// the emulator to avoid false negatives.
const PHONE_REGEX = /^\+/;

export const PhoneControl: React.FC<FormContextValues<AddAuthUserPayload> &
  PropsFromState> = ({ register, errors, allPhoneNumbers }) => {
  function validate(value: string) {
    return !allPhoneNumbers.has(value);
  }

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
        inputRef={register({ pattern: PHONE_REGEX, validate })}
      />
      <Typography
        className={styles.error}
        use="body2"
        role="alert"
        theme="error"
      >
        {errors.phoneNumber &&
          errors.phoneNumber.type === 'pattern' &&
          'Phone number must start with a "+"'}
        {errors.phoneNumber &&
          errors.phoneNumber.type === 'validate' &&
          'User with this phone number already exists]'}
      </Typography>
    </>
  );
};

export const mapStateToProps = createStructuredSelector({
  allPhoneNumbers: getAllPhoneNumbers,
});
export type PropsFromState = ReturnType<typeof mapStateToProps>;

export default connect(mapStateToProps)(PhoneControl);
