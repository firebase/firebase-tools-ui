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

import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Field } from '../../common/Field';
import { FirestoreAny } from '../models';

const JsonEditor: React.FC<{
  value: FirestoreAny;
  onChange: (value: FirestoreAny) => void;
  name: string;
}> = ({ value, onChange, name }) => {
  const [initialValue] = useState(JSON.stringify(value));
  const {
    errors,
    formState: { touched },
    register,
    unregister,
    setValue,
    triggerValidation,
  } = useFormContext();

  useEffect(() => {
    register(name, {
      validate: e => {
        try {
          JSON.parse(e);
          return true;
        } catch {
          return 'Must be valid JSON';
        }
      },
    });

    return () => unregister(name);
  }, [register, unregister, name]);

  async function handleChange(value: string) {
    if (await triggerValidation(name)) {
      onChange(JSON.parse(value));
    }
  }

  return (
    <Field
      label="JSON"
      defaultValue={initialValue}
      onChange={e => {
        setValue(name, e.currentTarget.value);
        handleChange(e.currentTarget.value);
      }}
      error={touched[name] && errors[name]?.message}
    />
  );
};

export default JsonEditor;
