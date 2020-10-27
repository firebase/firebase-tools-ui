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

import './Spinner.scss';

import { CircularProgress } from '@rmwc/circular-progress';
import { GridCell } from '@rmwc/grid';
import { Typography } from '@rmwc/typography';
import classnames from 'classnames';
import React from 'react';

export const Spinner: React.FC<{
  message?: string;
  span?: number;
  cover?: boolean;
  scrim?: boolean;
} & React.HTMLProps<any>> = ({ message, span, cover, scrim, ...props }) => {
  const children = (
    <>
      <CircularProgress size="xlarge" />
      {message && (
        <Typography use="body2" tag="p">
          {message}
        </Typography>
      )}
    </>
  );
  if (span === undefined) {
    return (
      <div className={classnames('Spinner', { cover, scrim })} {...props}>
        {children}
      </div>
    );
  } else {
    return (
      <GridCell span={span} align="middle" className="Spinner" {...props}>
        {children}
      </GridCell>
    );
  }
};
