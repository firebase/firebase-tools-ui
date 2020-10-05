import { Typography } from '@rmwc/typography';
import React from 'react';

import styles from './UsersTable.module.scss';

export const AuthZeroState: React.FC = () => {
  return (
    <Typography
      use="body2"
      className={styles.noResultsWrapper}
      theme="textSecondaryOnBackground"
    >
      No users for this project yet
    </Typography>
  );
};
