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

import React from 'react';
import { ThemeProvider, Theme } from '@rmwc/theme';
import { grey100 } from '../../colors';

import './Breadcrumb.scss';
import { IconButton } from '@rmwc/icon-button';
import { Link } from 'react-router-dom';

interface Props {
  root: string;
}

export const Breadcrumb: React.FC<Props> = ({ root }) => {
  return (
    <ThemeProvider options={{ surface: grey100 }} className="Breadcrumb">
      <Theme use={['surface']} className="Breadcrumb-container">
        <IconButton
          icon="home"
          ripple={false}
          tag={props => <Link to={root} {...props} />}
        />
      </Theme>
    </ThemeProvider>
  );
};
