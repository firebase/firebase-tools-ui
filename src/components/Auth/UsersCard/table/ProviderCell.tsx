/**
 * Copyright 2021 Google LLC
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
import { Theme } from '@rmwc/theme';
import React from 'react';

import { AuthUser, providerToIconMap } from '../../types';
import styles from './ProviderCell.module.scss';

export interface ProviderCellProps {
  user: AuthUser;
}

export const ProviderCell: React.FC<ProviderCellProps> = ({
  user,
}: ProviderCellProps) => {
  return (
    <Theme use="secondary">
      <div className={styles.iconWrapper}>
        {user.providerUserInfo.map(
          (providerInfo) =>
            providerToIconMap[providerInfo.providerId] && (
              <Icon
                icon={providerToIconMap[providerInfo.providerId]}
                key={providerInfo.providerId}
                aria-label={providerInfo.providerId}
              />
            )
        )}
      </div>
    </Theme>
  );
};
