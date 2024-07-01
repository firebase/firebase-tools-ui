import { Typography } from '@rmwc/typography';
import React from 'react';

import styles from './ZeroState.module.scss';

export const ZeroState: React.FC<React.PropsWithChildren<unknown>> = () => {
  return (
    <div className={styles.wrapper}>
      <Typography
        use="body2"
        className={styles.noResultsWrapper}
        theme="textSecondaryOnBackground"
      >
        No FireAlerts triggers for this project yet
      </Typography>
    </div>
  );
};