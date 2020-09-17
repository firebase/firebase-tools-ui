import { Icon } from '@rmwc/icon';
import { Theme } from '@rmwc/theme';
import React from 'react';

import { AuthUser } from '../../types';

export interface ProviderCellProps {
  user: AuthUser;
}

export const ProviderCell: React.FC<ProviderCellProps> = ({
  user,
}: ProviderCellProps) => {
  return (
    <Theme use="secondary">
      {user.email && (
        <Icon aria-label="Email" icon="alternate_email" theme="secondary" />
      )}
      {user.phoneNumber && (
        <Icon aria-label="Phone" icon="smartphone" theme="secondary" />
      )}
    </Theme>
  );
};
