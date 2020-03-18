import React, { ReactNode } from 'react';
import { Theme } from '@rmwc/theme';
import { Typography } from '@rmwc/typography';

import './Callout.scss';
import { IconPropT } from '@rmwc/types';
import { Icon } from '@rmwc/icon';

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
