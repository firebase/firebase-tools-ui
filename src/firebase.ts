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
import 'firebase/firestore';
// Force the browser build even in Node.js + jsdom unit tests because jsdom's
// File/Blob impl is incomplete (https://github.com/jsdom/jsdom/issues/2555)
// and thus not recognized by node-fetch, used by the Node build of Storage SDK.
// The browser build works because it uses XHR (also mocked by jsdom).
import '@firebase/storage/dist/index.browser.cjs.js';

import { _FirebaseApp } from '@firebase/app-types/private';
import { FirebaseAuthInternal } from '@firebase/auth-interop-types';
import { Component, ComponentType } from '@firebase/component';
import firebase from 'firebase/app';
import { useEffect, useState } from 'react';

import { useConfig } from './components/common/EmulatorConfigProvider';
import { DatabaseConfig } from './store/config';

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

/**
 * Get a JS SDK App instance with emulator Admin auth enabled.
 *
 * NOTE: Please make sure parameters are relatively stable (referentially equal
 * most of the time) or App may be recreated very often (expensive and bad UX)!
 *
 * For example, config should almost certainly be wrapped in useMemo, and
 * initialize wrapped in useCallback. (Or just use MODULE-LEVEL constants.)
 *
 * @param name a debug tag for the component using the app
 * @param config config passed into initializeApp. (useMemo recommended!)
 * @param initialize function for app setup. Should contain app.foo.useEmulator
 *   to avoid ever hitting production. (useCallback recommended!)
 * @returns the created app or undefined (only briefly, will fix itself). You
 *   may skip rendering children (return null) during the undefined period.
 */
export function useEmulatedFirebaseApp(
  name: string,
  config?: object,
  initialize?: (app: firebase.app.App) => void
): firebase.app.App | undefined {
  const { projectId } = useConfig();
  const [app, setApp] = useState<firebase.app.App | undefined>();

  useEffect(() => {
    if (!app) {
      const app = firebase.initializeApp(
        { ...config, projectId },
        `${name} component::${Math.random()}`
      );
      applyAdminAuth(app);
      initialize?.(app);
      setApp(app);
    }

    return () => {
      if (app) {
        setApp(undefined);
        // Errors may happen if app is already deleted. Ignore them.
        app.delete().catch(() => {});
      }
    };
  }, [app, name, config, projectId, initialize]);

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
        addAuthTokenListener: (listener) => {
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
