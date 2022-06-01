/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
