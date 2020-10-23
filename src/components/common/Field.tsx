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

import './Field.scss';

import { randomId } from '@rmwc/base';
import { Select, SelectProps } from '@rmwc/select';
import { TextField, TextFieldHTMLProps, TextFieldProps } from '@rmwc/textfield';
import { HTMLProps } from '@rmwc/types';
import { Typography } from '@rmwc/typography';
import classnames from 'classnames';
import React, { useState } from 'react';

type FieldProps = {
  fieldClassName?: string;
  tip?: string;
  error?: React.ReactNode | string;
} & TextFieldProps &
  TextFieldHTMLProps;

export const Field: React.FC<FieldProps> = ({
  fieldClassName,
  label,
  // strip fullwidth or outlined, always use outlined
  fullwidth,
  outlined,
  tip,
  error,
  ...textFieldProps
}) => {
  const [id] = useState(randomId('field'));
  const [subtextId] = useState(randomId('field-subtext'));
  return (
    <div className={classnames('Field', fieldClassName)}>
      <Typography
        className="Field-label"
        use="body2"
        theme="secondary"
        tag="label"
        htmlFor={id}
      >
        {label}
      </Typography>
      <TextField
        outlined
        aria-describedby={subtextId}
        invalid={!!error}
        aria-invalid={!!error}
        {...textFieldProps}
        tag="div"
        id={id}
      />
      <div className="Field-subtext" id={subtextId}>
        {error ? (
          <Typography
            className="Field-tip"
            role="alert"
            use="body2"
            theme="error"
          >
            {error}
          </Typography>
        ) : (
          tip && (
            <Typography className="Field-tip" use="body2" theme="secondary">
              {tip}
            </Typography>
          )
        )}
      </div>
    </div>
  );
};

type SelectFieldProps = {
  fieldClassName?: string;
  tip?: string;
  error?: string;
} & SelectProps &
  HTMLProps<HTMLSelectElement>;

export const SelectField: React.FC<SelectFieldProps> = ({
  fieldClassName,
  label,
  // strip outlined bool, always use outlined
  outlined,
  tip,
  theme, // TODO: 5.0 theme, incompatible with 6.0 remove at 6.0
  error,
  ...selectProps
}) => {
  const [id] = useState(randomId());
  return (
    <div className={classnames('Field', fieldClassName)}>
      <Typography
        className="Field-label"
        use="body2"
        theme="secondary"
        tag="label"
        htmlFor={id}
      >
        {label}
      </Typography>
      <Select outlined {...selectProps} id={id} />
      <div className="Field-subtext">
        {error ? (
          <Typography className="Field-tip" use="body2" theme="error">
            {error}
          </Typography>
        ) : (
          tip && (
            <Typography className="Field-tip" use="body2" theme="secondary">
              {tip}
            </Typography>
          )
        )}
      </div>
    </div>
  );
};

export type FieldWithAutocompleteHackProps = FieldProps & {
  setValue: (name: string, value: string) => void;
};

/**
 * The hack below is needed to track autofill event on inputs.
 *
 * If you click on an input, and it becomes empty, use it!
 *
 * When the autofill is triggered, empty animation starts playing which
 * allows us to handle the result appropriately.
 *
 * Note that this also comes with an empty animation for all inputs in
 * _material-overrides.scss
 */
export const FieldWithAutocompleteHack: React.FC<FieldWithAutocompleteHackProps> = ({
  setValue,
  ...props
}) => {
  return (
    <Field
      onAnimationStart={e => {
        const target = e.target as HTMLInputElement;
        setValue(target.name, target.value);
      }}
      {...props}
    />
  );
};
