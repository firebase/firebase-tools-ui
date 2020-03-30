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

import { firestore } from 'firebase';
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Field } from '../../common/Field';
import { useApi } from '../ApiContext';

const ReferenceEditor: React.FC<{
  value: firestore.DocumentReference;
  onChange: (value: firestore.DocumentReference) => void;
  name: string;
}> = ({ value, onChange, name }) => {
  const [path] = useState(value.path);
  const api = useApi();
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
          api.database.doc(e);
          return true;
        } catch {
          return 'Must point to a document';
        }
      },
    });

    return () => unregister(name);
  }, [register, unregister, name, api]);

  async function handleChange(value: string) {
    if (await triggerValidation(name)) {
      onChange(api.database.doc(value));
    }
  }

  return (
    <Field
      label="Document path"
      defaultValue={path}
      onChange={e => {
        setValue(name, e.currentTarget.value);
        handleChange(e.currentTarget.value);
      }}
      error={touched[name] && errors[name]?.message}
    />
  );
};

// api.doc(path)

export default ReferenceEditor;
