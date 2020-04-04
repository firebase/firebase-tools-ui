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

import { Select, SelectProps } from '@rmwc/select';
import { TextField, TextFieldHTMLProps, TextFieldProps } from '@rmwc/textfield';
import { HTMLProps } from '@rmwc/types';
import { Typography } from '@rmwc/typography';
import React, { useState } from 'react';

import { uuid } from './utils';

type Props = { tip?: string; error?: string } & TextFieldProps &
  TextFieldHTMLProps;

export const Field: React.FC<Props> = ({
  label,
  // strip fullwidth or outlined, always use outlined
  fullwidth,
  outlined,
  tip,
  error,
  ...textFieldProps
}) => {
  const [id] = useState(uuid());
  return (
    <div className="Field">
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
        invalid={!!error}
        {...textFieldProps}
        tag="div"
        id={id}
      />
      {tip && (
        <Typography className="Field-tip" use="body2" theme="secondary">
          {tip}
        </Typography>
      )}
      {error && (
        <Typography className="Field-tip" use="body2" theme="error">
          {error}
        </Typography>
      )}
    </div>
  );
};

type SelectFieldProps = { tip?: string } & SelectProps &
  HTMLProps<HTMLSelectElement>;

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  // strip outlined bool, always use outlined
  outlined,
  tip,
  theme, // TODO: 5.0 theme, incompatible with 6.0 remove at 6.0
  ...selectProps
}) => {
  const [id] = useState(uuid());
  return (
    <div className="Field">
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
      {tip && (
        <Typography className="Field-tip" use="body2" theme="secondary">
          {tip}
        </Typography>
      )}
      {/* TODO: Error text */}
    </div>
  );
};
