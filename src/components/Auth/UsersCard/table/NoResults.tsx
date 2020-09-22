import { Typography } from '@rmwc/typography';
import React from 'react';

import styles from './UsersTable.module.scss';

export const NoResults: React.FC = () => {
  return (
    <Typography
      use="body2"
      aria-live="polite"
      className={styles.noResultsWrapper}
    >
      No results
    </Typography>
  );
};
