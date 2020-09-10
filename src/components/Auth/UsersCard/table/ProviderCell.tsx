import { Icon } from '@rmwc/icon';
import React from 'react';

import { AuthUser } from '../../types';

export interface ProviderCellProps {
  user: AuthUser;
}

export const ProviderCell: React.FC<ProviderCellProps> = ({
  user,
}: ProviderCellProps) => {
  return (
    <>
      {user.email && <Icon aria-label="Email" icon="alternate_email" />}
      {user.phone && <Icon aria-label="Phone" icon="smartphone" />}
    </>
  );
};
