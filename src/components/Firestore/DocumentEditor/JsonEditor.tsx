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

import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Field } from '../../common/Field';
import { FirestoreAny } from '../models';

const JsonEditor: React.FC<
  React.PropsWithChildren<{
    value: FirestoreAny;
    onChange: (value: FirestoreAny) => void;
    name: string;
  }>
> = ({ value, onChange, name }) => {
  const [initialValue] = useState(JSON.stringify(value));
  const { trigger } = useFormContext();

  async function handleChange(value: string) {
    if (await trigger(name)) {
      onChange(JSON.parse(value));
    }
  }

  return (
    <Controller
      name={name}
      rules={{
        validate: (e) => {
          try {
            JSON.parse(e);
            return true;
          } catch {
            return 'Must be valid JSON';
          }
        },
      }}
      render={({ field: { ref, ...field }, fieldState }) => (
        <Field
          label="JSON"
          defaultValue={initialValue}
          error={fieldState.isTouched && fieldState.error?.message}
          {...field}
          onChange={(e) => {
            field.onChange(e.currentTarget.value);
            handleChange(e.currentTarget.value);
          }}
        />
      )}
    />
  );
};

export default JsonEditor;
