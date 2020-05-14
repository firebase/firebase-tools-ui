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

import './ValueDisplay.scss';

import { Typography, TypographyProps } from '@rmwc/typography';
import * as React from 'react';
import { DOMAttributes } from 'react';

export interface Props extends DOMAttributes<HTMLSpanElement>, TypographyProps {
  value: string | number | boolean | null;
}

export const ValueDisplay = React.memo<Props>(function ValueDisplay$({
  value,
  use,
  ...otherProps
}) {
  const trimmedValue =
    typeof value === 'string' && value.length >= 24
      ? `${value.substr(0, 21)}...`
      : value;

  const getClass = (value: Props['value']) =>
    `ValueDisplay ValueDisplay__${typeof value}`;
  return (
    <Typography
      use="body1"
      className={getClass(value)}
      {...otherProps}
      aria-label="Node value"
    >
      {JSON.stringify(trimmedValue)}
    </Typography>
  );
});
