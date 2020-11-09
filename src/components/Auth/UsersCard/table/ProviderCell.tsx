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
          providerInfo =>
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
