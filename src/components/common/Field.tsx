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

import { Select, SelectHTMLProps, SelectProps } from '@rmwc/select';
import { TextField, TextFieldHTMLProps, TextFieldProps } from '@rmwc/textfield';
import { Typography } from '@rmwc/typography';
import React from 'react';

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
  return (
    <label className="Field">
      <Typography className="Field-label" use="body2" theme="secondary">
        {label}
      </Typography>
      <TextField outlined invalid={!!error} {...textFieldProps} tag="div" />
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
    </label>
  );
};

type SelectFieldProps = { tip?: string } & SelectProps & SelectHTMLProps;

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  // strip outlined bool, always use outlined
  outlined,
  tip,
  ...selectProps
}) => {
  return (
    <label className="Field">
      <Typography className="Field-label" use="body2" theme="secondary">
        {label}
      </Typography>
      <Select outlined {...selectProps} tag="div" />
      {tip && (
        <Typography className="Field-tip" use="body2" theme="secondary">
          {tip}
        </Typography>
      )}
      {/* TODO: Error text */}
    </label>
  );
};
