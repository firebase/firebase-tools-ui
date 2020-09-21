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
      <Typography
        className="Field-label"
        use="body2"
        theme="secondary"
        tag="label"
      >
        <legend>Custom Claims</legend>
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
          {fields.length > 1 && (
            <IconButton
              label="Add field"
              type="button"
              aria-label="Remove custom claim"
              icon="close"
              onClick={() => {
                remove(index);
              }}
            />
          )}
        </div>
      ))}
      <Button
        type="button"
        onClick={() => {
          append({});
        }}
      >
        Add another
      </Button>
    </fieldset>
  );
};
