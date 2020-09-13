/**
 * Copyright 2020 Google LLC
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

import 'firebase/database';

import { _FirebaseApp } from '@firebase/app-types/private';
import { FirebaseAuthInternal } from '@firebase/auth-interop-types';
import { Component, ComponentType } from '@firebase/component';
import firebase from 'firebase/app';
import { useEffect, useMemo } from 'react';

import { DatabaseConfig } from './store/config';
import { useProjectId } from './store/config/selectors';

interface WindowWithDb extends Window {
  database?: firebase.database.Database;
  firestore?: firebase.firestore.Firestore;
}

export function initDatabase(
  config: DatabaseConfig,
  namespace: string
): [firebase.database.Database, { cleanup: () => Promise<void> }] {
  const databaseURL = `http://${config.hostAndPort}/?ns=${namespace}`;
  const app = firebase.initializeApp(
    { databaseURL },
    `Database Component: ${databaseURL} ${Math.random()}`
  );
  applyAdminAuth(app);
  const db = app.database();
  // only log the first time
  if (!(window as WindowWithDb).database) {
    console.log(`🔥 Realtime Database is available at window.database.

    Try:
    database.ref().set({hello: 'world!'});
    database.ref().once('value').then( snap => console.log(snap.val()) );`);
  }
  (window as WindowWithDb).database = db;
  return [db, { cleanup: () => app.delete() }];
}

export function useEmulatedFirebaseApp(name: string, config: any) {
  const projectId = useProjectId();

  const app = useMemo(() => {
    const app = firebase.initializeApp(
      { ...config, projectId },
      `${name} component::${Math.random()}`
    );
    applyAdminAuth(app);
    return app;
  }, [name, config, projectId]);

  useEffect(() => {
    return () => {
      app.delete();
    };
  }, [app]);

  return app;
}

function applyAdminAuth(app: firebase.app.App): void {
  const accessToken = 'owner'; // Accepted as admin by emulators.
  const mockAuthComponent = new Component(
    'auth-internal',
    () =>
      ({
        getToken: async () => ({ accessToken: accessToken }),
        getUid: () => null,
        addAuthTokenListener: listener => {
          // Call listener once immediately with predefined
          // accessToken.
          listener(accessToken);
        },
        removeAuthTokenListener: () => {},
      } as FirebaseAuthInternal),
    'PRIVATE' as ComponentType
  );

  ((app as unknown) as _FirebaseApp)._addOrOverwriteComponent(
    mockAuthComponent
  );
}
