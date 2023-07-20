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

import { doc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useFirestore } from 'reactfire';

import { Field } from '../../common/Field';
import { DocumentPath } from './types';

const ReferenceEditor: React.FC<
  React.PropsWithChildren<{
    value: DocumentPath;
    onChange: (value: DocumentPath) => void;
    name: string;
  }>
> = ({ value, onChange, name }) => {
  const firestore = useFirestore();
  const { trigger } = useFormContext();
  console.log("reference editor s value: " + JSON.stringify(value));
  console.log("reference editor s path: " + JSON.stringify(value.path));

  async function handleChange(value: string) {
    if (await trigger(name)) {
      onChange(new DocumentPath(value));
    }
  }

  return (
    <Controller
      name={name}
      rules={{
        validate: (e) => {
          try {
            doc(firestore, e);
            return true;
          } catch {
            return 'Must point to a document';
          }
        },
      }}
      render={({ field: { ref, ...field }, fieldState }) => (
        <Field
          label="Document path"
          defaultValue={value.path}
          {...field}
          onChange={(e) => {
            console.log("onchange inside ReferenceEditor: " + JSON.stringify(e.currentTarget.value));

            field.onChange(e.currentTarget.value);
            handleChange(e.currentTarget.value);
          }}
          error={fieldState.error?.message}
        />
      )}
    />
  );
};

// api.doc(path)

export default ReferenceEditor;
