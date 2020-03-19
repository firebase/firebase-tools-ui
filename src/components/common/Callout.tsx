import './Callout.scss';

import { Icon } from '@rmwc/icon';
import { Theme } from '@rmwc/theme';
import { IconPropT } from '@rmwc/types';
import { Typography } from '@rmwc/typography';
import React, { ReactNode } from 'react';

export interface CalloutProps {
  actions?: ReactNode;
  icon?: IconPropT;
}

export const Callout: React.FC<CalloutProps> = ({
  children,
  actions,
  icon,
}) => (
  <div className="Callout">
    <Theme use="secondary" wrap>
      <Typography use="subtitle2" tag="div" className="Callout-body">
        {icon && <Icon icon={icon} />}
        {children}
      </Typography>
    </Theme>
    <div className="Callout-actions">{actions}</div>
  </div>
);
