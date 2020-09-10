import React from 'react';

import styles from './UsersTable.module.scss';

export const AuthZeroState: React.FC = () => {
  return (
    <div className={styles.zeroStateWrapper}>No users for this project yet</div>
  );
};
