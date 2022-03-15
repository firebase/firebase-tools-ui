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

import { Icon } from '@rmwc/icon';
import { Typography } from '@rmwc/typography';
import React from 'react';

import { useExtension } from '../../../api/useExtension';
import { DetailItemCard } from '../DetailItemCard/DetailItemCard';
import styles from './AccessAndRoles.module.scss';

export const AccessAndRoles: React.FC = () => {
  const extension = useExtension()!;

  return (
    <>
      <Typography use="body2" tag="div" className={styles.explanation}>
        This extension has an associated{' '}
        <a href="https://firebase.google.com/docs/extensions/permissions-granted-to-extension">
          service account
        </a>{' '}
        that has the following access to your project and resources:
      </Typography>
      <section className={styles.wrapper}>
        {(extension.roles || []).map((role) => (
          <DetailItemCard
            key={role.role}
            header={
              <div className={styles.headerWrapper}>
                <Icon icon={{ icon: 'build', size: 'small' }} />
                <Typography use="subtitle2" tag="h4">
                  {role.role}
                </Typography>
              </div>
            }
            content={<div>{role.reason}</div>}
          />
        ))}
      </section>
    </>
  );
};
