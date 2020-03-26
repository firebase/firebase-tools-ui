/**
 * Copyright 2020 Google LLC
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

import { TextField } from '@rmwc/textfield';
import React, { useEffect, useState } from 'react';
import { Controller, ErrorMessage, useFormContext } from 'react-hook-form';

const NumberEditor: React.FC<{
  value: number;
  onChange: (value: number) => void;
  name: string;
}> = ({ value, onChange, name }) => {
  const [number, setNumber] = useState(String(value));
  const {
    errors,
    formState: { touched },
    getValues,
  } = useFormContext();

  useEffect(() => {
    const num = parseFloat(number);
    if (!isNaN(num)) {
      onChange(num);
    }
  }, [number, onChange]);

  console.log({ errors, touched, values: getValues() });
  console.log(errors[name]);

  return (
    //<TextField
    //  label="Value"
    //  outlined
    //  type="string"
    //  value={number}
    //  onChange={(e) => setNumber(e.currentTarget.value)}
    ///>
    <>
      <Controller
        as={TextField}
        name={name}
        defaultValue={number}
        onChange={([e]) => {
          // console.log(e);
          // Continue validation while updating the document-store
          // setNumber(e.currentTarget.value);
          // dispatch(actions.updateName({ id, name: e.currentTarget.value }));
          return e;
        }}
        rules={{
          required: 'This is really required',
          // validate: (value) => value === '1',
        }}
        outlined
        label="Value"
        invalid={touched[name] && errors[name]}
      />
      <ErrorMessage errors={errors} name={name} />
    </>
  );
};

export default NumberEditor;
