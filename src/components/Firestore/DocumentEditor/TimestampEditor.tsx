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

import { Timestamp } from 'firebase/firestore';
import React from 'react';
import { Controller } from 'react-hook-form';

import { Field } from '../../common/Field';

function dateToLocale(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dateOfMonth = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${dateOfMonth}T${hours}:${minutes}:${seconds}`;
}

// TODO: update to a date-picker that potentially supports time-zones
const TimestampEditor: React.FC<
  React.PropsWithChildren<{
    value: Timestamp;
    onChange: (value: Timestamp) => void;
    name: string;
  }>
> = ({ value, onChange, name }) => {
  return (
    <Controller
      name={name}
      rules={{
        validate: (e) => {
          return !isNaN(Date.parse(e)) || 'Must be a date-time';
        },
      }}
      render={({ field: { ref, ...field }, fieldState }) => (
        <Field
          label="Value"
          type="datetime-local"
          step={1}
          defaultValue={dateToLocale(value.toDate())}
          error={fieldState.error?.message}
          {...field}
          onChange={(e) => {
            const timestamp = Date.parse(e.currentTarget.value);
            field.onChange(e.currentTarget.value);
            if (!isNaN(timestamp) && timestamp !== value.toMillis()) {
              onChange(Timestamp.fromMillis(timestamp));
            }
          }}
        />
      )}
    />
  );
};

export default TimestampEditor;
