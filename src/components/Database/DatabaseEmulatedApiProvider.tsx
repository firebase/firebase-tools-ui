/**
 * Copyright 2022 Google LLC
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

import { FirebaseApp } from 'firebase/app';
import { connectDatabaseEmulator, getDatabase } from 'firebase/database';
import React, { useCallback } from 'react';
import {
  DatabaseProvider,
  FirebaseAppProvider,
  useFirebaseApp,
} from 'reactfire';

import { useEmulatedFirebaseApp } from '../../firebase';
import { useEmulatorConfig } from '../common/EmulatorConfigProvider';
import { NamespaceProvider, useNamespace } from './useNamespace';

const DATABASE_OPTIONS = {};

/**
 * Provide a local-FirebaseApp with an RTDB SDK connected to
 * the Emulator Hub.
 */
export const DatabaseEmulatedApiProvider: React.FC<
  React.PropsWithChildren<{ namespace: string }>
> = React.memo(({ namespace, children }) => {
  const databaseUrl = useDatabaseUrl(namespace);
  const config = useEmulatorConfig('database');
  const app = useEmulatedFirebaseApp(
    'database',
    DATABASE_OPTIONS,
    useCallback(
      (app: FirebaseApp) => {
        const database = getDatabase(app, databaseUrl);
        connectDatabaseEmulator(database, config.host, config.port, {
          mockUserToken: 'owner',
        });
      },
      [config, databaseUrl]
    )
  );
  if (!app) {
    return null;
  }

  return (
    <FirebaseAppProvider firebaseApp={app}>
      <NamespaceProvider namespace={namespace}>
        <DatabaseComponent namespace={namespace}>{children}</DatabaseComponent>
      </NamespaceProvider>
    </FirebaseAppProvider>
  );
});

const DatabaseComponent: React.FC<
  React.PropsWithChildren<{ namespace: string }>
> = ({ namespace, children }) => {
  const app = useFirebaseApp();
  const databaseUrl = useDatabaseUrl(namespace);
  const database = getDatabase(app, databaseUrl);
  return <DatabaseProvider sdk={database}>{children}</DatabaseProvider>;
};

function useDatabaseUrl(namespace: string) {
  const config = useEmulatorConfig('database');

  return `http://${config.hostAndPort}/?ns=${namespace}`;
}
