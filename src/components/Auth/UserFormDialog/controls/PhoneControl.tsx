import React from 'react';
import { FormContextValues } from 'react-hook-form/dist/contextTypes';

import { Field } from '../../../common/Field';
import { AddAuthUserPayload } from '../../types';

export const PhoneControl: React.FC<FormContextValues<AddAuthUserPayload>> = ({
  register,
}) => {
  return (
    <>
      <Field
        name="phone"
        label="Phone authentication"
        placeholder="Enter phone number"
        type="phone"
        inputRef={register()}
      />
    </>
  );
};
