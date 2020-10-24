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

export type PhoneControlProps = PropsFromState & {
  editedUserPhoneNumber?: string;
};

export const PhoneControl: React.FC<PhoneControlProps &
  FormContextValues<AddAuthUserPayload>> = ({
  register,
  errors,
  allPhoneNumbers,
  editedUserPhoneNumber,
}) => {
  function validate(value: string) {
    return editedUserPhoneNumber === value || !allPhoneNumbers.has(value);
  }

  function getErrorText() {
    if (errors.phoneNumber) {
      if (errors.phoneNumber.type === 'pattern') {
        return 'Phone number must be in international format and start with a "+"';
      }
      if (errors.phoneNumber.type === 'validate') {
        return 'User with this phone number already exists';
      }
    }
  }

  return (
    <>
      <Typography
        use="body1"
        tag="div"
        className={styles.authKindLabel}
        theme="textPrimaryOnBackground"
      >
        Phone authentication
      </Typography>
      <Field
        name="phoneNumber"
        label="Phone"
        placeholder="Enter phone number"
        type="tel"
        error={getErrorText()}
        inputRef={register({ pattern: PHONE_REGEX, validate })}
      />
    </>
  );
};

export const mapStateToProps = createStructuredSelector({
  allPhoneNumbers: getAllPhoneNumbers,
});
export type PropsFromState = ReturnType<typeof mapStateToProps>;

export default connect(mapStateToProps)(PhoneControl);
