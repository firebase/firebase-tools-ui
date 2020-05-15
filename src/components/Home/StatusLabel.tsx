import { Icon } from '@rmwc/icon';
import { Typography } from '@rmwc/typography';
import React from 'react';

import { CustomThemeProvider } from '../../themes';
import styles from './StatusLabel.module.scss';

const ACTIVE_ICON = {
  icon: 'check_circle',
  size: 'xsmall',
};

const INACTIVE_ICON = {
  icon: 'block',
  size: 'xsmall',
};

/** A basic On/Off label with icon */
export const StatusLabel: React.FC<{
  isActive: boolean;
}> = ({ isActive }) => {
  return (
    <CustomThemeProvider use={isActive ? 'success' : 'note'} wrap>
      <Typography
        use="headline6"
        tag="div"
        theme={isActive ? 'primary' : 'secondary'}
        className={styles.container}
      >
        {isActive ? 'On' : 'Off'}
        <Icon
          icon={isActive ? ACTIVE_ICON : INACTIVE_ICON}
          className={styles.icon}
        />
      </Typography>
    </CustomThemeProvider>
  );
};
