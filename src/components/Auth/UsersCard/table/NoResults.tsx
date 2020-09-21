import React from 'react';

import styles from './UsersTable.module.scss';

export const NoResults: React.FC = () => {
  // TODO(kirjs): implement the actual no results state.
  return (
    <div aria-live="polite" className={styles.noResultsWrapper}>
      No results
    </div>
  );
};
