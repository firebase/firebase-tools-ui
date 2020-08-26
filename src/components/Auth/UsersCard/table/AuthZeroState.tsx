import React from 'react';

import styles from './UsersTable.module.scss';

export const AuthZeroState: React.FC = () => {
  // TODO(kirjs): implement the actual zero state.
  return <div className={styles.zeroStateWrapper}>No users</div>;
};
