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

import { Callout } from '../../common/Callout';
import { DocsLink } from '../../common/links/DocsLink';
import styles from './ExtensionsCallout.module.scss';

export const ExtensionCallout: React.FC<
  React.PropsWithChildren<unknown>
> = () => {
  return (
    <div className={styles.callout}>
      <Callout
        aside={true}
        actions={
          <div className={styles.link}>
            <DocsLink
              href="extensions/manage-installed-extensions"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Typography theme="primary" use="body2" className={styles.link}>
                Learn how to manage your extensions
              </Typography>
            </DocsLink>
          </div>
        }
      >
        Extensions in the emulator show up here.
      </Callout>
    </div>
  );
};
