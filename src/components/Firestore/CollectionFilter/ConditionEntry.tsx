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
import { Controller, useFormContext } from 'react-hook-form';

import { Field, SelectField } from '../../../components/common/Field';
import { NUMBER_REGEX, isBoolean, isNumber } from '../utils';
import styles from './CollectionFilter.module.scss';

function getConditionEntryType(value: any) {
  if (isBoolean(value)) {
    return 'boolean';
  }
  if (isNumber(value)) {
    return 'number';
  }
  return 'string';
}

interface ConditionEntryProps {
  name: string;
  // Error may be undefined; require consumers to still pass or we might end up
  // in a state where we validate without showing the error message.
  error: string | undefined;
}

export const ConditionEntry: React.FC<ConditionEntryProps> = React.memo(
  ({ name, error }) => {
    const { setValue, watch } = useFormContext();
    const value = watch(name);
    const [fieldType, setFieldType] = useState(getConditionEntryType(value));

    useEffect(() => {
      // Essentially setting the defaultValue of this form-field,
      // specifically when chaning types between Single <--> Multi
      if (value === undefined) {
        setValue(name, '');
      }
    }, [value, setValue, name]);

    return (
      <div className={styles.conditionEntry}>
        <SelectField
          options={['string', 'number', 'boolean']}
          value={fieldType}
          onChange={evt => {
            setFieldType(evt.currentTarget.value);
          }}
          fieldClassName={styles.conditionEntryType}
        />

        {fieldType === 'string' && (
          <Controller
            as={Field}
            name={name}
            defaultValue=""
            error={error}
            fieldClassName={styles.conditionEntryValue}
            aria-label="Value"
          />
        )}

        {fieldType === 'number' && (
          <Controller
            as={Field}
            name={name}
            defaultValue={''}
            rules={{
              pattern: {
                value: NUMBER_REGEX,
                message: 'Must be a number',
              },
            }}
            error={error}
            onChange={([event]) =>
              // Cast it back to a number before saving to model
              event.target.value.match(NUMBER_REGEX)
                ? parseFloat(event.target.value)
                : event.target.value
            }
            fieldClassName={styles.conditionEntryValue}
            aria-label="Value"
          />
        )}

        {fieldType === 'boolean' && <BooleanCondition name={name} />}
      </div>
    );
  }
);

// RMWC select-menus do not work well with boolean values, requiring
// custom-registration w/ the parent form
const BooleanCondition: React.FC<{ name: string }> = ({ name }) => {
  const { register, setValue, unregister, watch } = useFormContext();

  useEffect(() => {
    register({ name });
    setValue(name, true);

    return () => unregister(name);
  }, [register, unregister, setValue, name]);

  const selectValue = watch(name);

  return (
    <SelectField
      name={name}
      options={['true', 'false']}
      value={selectValue}
      onChange={evt => setValue(name, evt.currentTarget.value === 'true')}
      fieldClassName={styles.conditionEntryValue}
      aria-label="Value"
    />
  );
};
