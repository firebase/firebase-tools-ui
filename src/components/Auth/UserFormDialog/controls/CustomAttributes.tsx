import { Button } from '@rmwc/button';
import { IconButton } from '@rmwc/icon-button';
import { Typography } from '@rmwc/typography';
import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { FormContextValues } from 'react-hook-form/dist/contextTypes';

import { Field } from '../../../common/Field';
import { AddAuthUserPayload } from '../../types';
import styles from './controls.module.scss';

export const CustomAttributes: React.FC<FormContextValues<
  AddAuthUserPayload
>> = ({ control, register }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'customAttributes',
  });

  return (
    <fieldset className={styles.customAttributesWrapper}>
      <Typography use="subtitle2" tag="legend">
        Custom Claims
      </Typography>
      <Typography use="body2">
        These custom key:value attributes can be used with Rules to implement
        various access control strategies (e.g. based on roles). Learn more
      </Typography>

      {fields.map((item, index) => (
        <div role="group" key={item.id}>
          <Field
            name={`customAttributes[${index}].role`}
            inputRef={register({})}
            placeholder="Role"
            aria-label="Role"
            defaultValue={item.role}
          />
          <Field
            name={`customAttributes[${index}].value`}
            placeholder="Value"
            aria-label="Value"
            inputRef={register({})}
            defaultValue={item.role}
          />
          {
            <IconButton
              label="Add field"
              type="button"
              aria-label="Remove custom claim"
              icon="close"
              onClick={() => {
                remove(index);
              }}
            />
          }
        </div>
      ))}
      <Button
        type="button"
        onClick={() => {
          append({});
        }}
      >
        {fields.length === 0 ? 'Add claim' : 'Add another'}
      </Button>
    </fieldset>
  );
};
