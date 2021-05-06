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

import { GridCell } from '@rmwc/grid';
import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import { getStorageConfigResult } from '../../store/config/selectors';
import { handle } from '../../store/utils';
import { EmulatorDisabled } from '../common/EmulatorDisabled';
import { Spinner } from '../common/Spinner';
import { useBuckets } from './api/useBuckets';
import { StorageCanvas } from './Canvas/Canvas';
import { StorageCard } from './Card/StorageCard';
import { storagePath } from './common/constants';
import styles from './index.module.scss';
import { StorageFirebaseAppProvider } from './providers/StorageFirebaseAppProvider';

export const Storage: React.FC = () => {
  const configResult = useSelector(getStorageConfigResult);

  const spinner = <Spinner span={12} message="Storage Emulator Loading..." />;

  return handle(configResult, {
    onNone: () => spinner,
    onError: () => <StorageRouteDisabled />,
    onData: (config) => {
      return config === undefined ? (
        <StorageRouteDisabled />
      ) : (
        <Suspense fallback={spinner}>
          <StorageRoute>
            <StorageWrapper />
          </StorageRoute>
        </Suspense>
      );
    },
  });
};

export const StorageWrapper: React.FC = () => {
  return (
    <StorageFirebaseAppProvider>
      <GridCell span={12} className={styles.storageWrapper}>
        <StorageCanvas />
        <Suspense fallback={<Spinner />}>
          <StorageCard />
        </Suspense>
      </GridCell>
    </StorageFirebaseAppProvider>
  );
};

export const StorageRoute: React.FC = ({ children }) => {
  const [bucket] = useBuckets();

  return (
    <Switch>
      <Route exact path={storagePath + `:bucket/:path*`}>
        {children}
      </Route>
      <Route exact path={storagePath}>
        <Redirect to={storagePath + bucket} />
      </Route>
    </Switch>
  );
};

export const StorageRouteDisabled: React.FC = () => (
  <EmulatorDisabled productName="Storage" />
);
