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

import firebase from 'firebase';
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

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
const TimestampEditor: React.FC<{
  value: firebase.firestore.Timestamp;
  onChange: (value: firebase.firestore.Timestamp) => void;
  name: string;
}> = ({ value, onChange, name }) => {
  const [date, setDate] = useState(value.toDate());

  const {
    errors,
    formState: { touched },
    register,
    unregister,
    setValue,
  } = useFormContext();

  useEffect(() => {
    register(name, {
      validate: e => !isNaN(e) || 'Must be a date-time',
    });

    return () => unregister(name);
  }, [register, unregister, name]);

  useEffect(() => {
    if (value.toMillis() !== date.getTime()) {
      onChange(firebase.firestore.Timestamp.fromDate(date));
    }
  }, [value, date, onChange]);

  return (
    <Field
      label="Value"
      type="datetime-local"
      defaultValue={dateToLocale(date)}
      onChange={e => {
        const timestamp = Date.parse(e.currentTarget.value);
        setValue(name, timestamp, true);
        if (!isNaN(timestamp) && timestamp !== date.getTime()) {
          setDate(new Date(timestamp));
        }
      }}
      error={touched[name] && errors[name]?.message}
    />
  );
};

export default TimestampEditor;
