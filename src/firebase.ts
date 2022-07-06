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

import { FirebaseApp, deleteApp, initializeApp } from 'firebase/app';
import {
  Database,
  connectDatabaseEmulator,
  getDatabase,
} from 'firebase/database';
import { Firestore } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useConfig } from './components/common/EmulatorConfigProvider';
import { DatabaseConfig } from './store/config';

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
  initialize?: (app: FirebaseApp) => void
): FirebaseApp | undefined {
  const { projectId } = useConfig();
  const [app, setApp] = useState<FirebaseApp | undefined>();

  useEffect(() => {
    if (!app) {
      const app = initializeApp(
        { ...config, projectId },
        `${name} component::${Math.random()}`
      );
      initialize?.(app);
      setApp(app);
    }

    return () => {
      if (app) {
        setApp(undefined);
        // Errors may happen if app is already deleted. Ignore them.
        deleteApp(app).catch(() => {});
      }
    };
  }, [app, name, config, projectId, initialize]);

  return app;
}
