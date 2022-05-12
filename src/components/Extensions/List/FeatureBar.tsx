/**
 * Copyright 2022 Google LLC
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
import { Typography } from '@rmwc/typography';
import React from 'react';
import { Link } from 'react-router-dom';

import styles from './FeatureBar.module.scss';

export const ExtensionsFeatureBar: React.FC<
  React.PropsWithChildren<unknown>
> = () => {
  return (
    <div className={styles.featureBar}>
      <Typography use="headline5" tag="h2">
        Extensions
      </Typography>
    </div>
  );
};

export interface ExtensionFeatureBarProps {
  name: string;
}

export const ExtensionFeatureBar: React.FC<
  React.PropsWithChildren<ExtensionFeatureBarProps>
> = ({ name }) => {
  return (
    <header className={styles.featureBar}>
      <Link to="/extensions">
        <Typography
          use="body1"
          theme="secondary"
          tag="div"
          className={styles.extensionsLink}
        >
          Extensions
        </Typography>
      </Link>
      <Typography use="headline5" tag="h2">
        {name}
      </Typography>
    </header>
  );
};
