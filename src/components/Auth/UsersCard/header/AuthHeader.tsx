import { Button } from '@rmwc/button';
import React from 'react';

import {
  CardActionBar,
  CardActionBarActions,
} from '../../../common/CardActionBar';
import AuthFilter from './AuthFilter';
import styles from './AuthHeader.module.scss';
import RefreshButton from './RefreshButton';

export interface AuthHeaderProps {
  onOpenNewUserDialog: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  onOpenNewUserDialog,
}) => {
  return (
    <>
      <CardActionBar>
        <AuthFilter />
        <div className={styles.barActions}>
          <CardActionBarActions>
            <RefreshButton />
            <Button
              className={styles.addUserButton}
              unelevated
              onClick={() => onOpenNewUserDialog()}
            >
              Add user
            </Button>
          </CardActionBarActions>
        </div>
      </CardActionBar>
    </>
  );
};
