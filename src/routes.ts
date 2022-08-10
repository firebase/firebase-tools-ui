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

import React from 'react';
import { matchPath } from 'react-router';

import Auth from './components/Auth';
import Database from './components/Database';
import { ExtensionsRoute } from './components/Extensions';
import Firestore from './components/Firestore';
import Home from './components/Home';
import LogsViewer from './components/LogViewer';
import { Storage } from './components/Storage';

export interface Route {
  path: string;
  component: React.FC<React.PropsWithChildren<unknown>>;
  label: string;
  exact: boolean;
  showInNav: boolean;
}

// Routes must be in a form React Router would understand
const routesToSanitize: string[] = [
  // Auth
  '/auth/:tenantId',

  // Database
  '/database/:namespace/data/:path*',

  // Extensions
  '/extensions/:instanceId',

  // Firestore
  '/firestore/data/:path*',
  '/firestore/requests/:requestId',

  // Storage
  '/storage/:bucket/:path*',
];

export function scrubPathData(pathname: string): {
  scrubbedPath: string;
  pathLabel: string;
} {
  const routeMatch = routes.find((r) =>
    matchPath(pathname as string, {
      path: r.path,
      exact: r.exact,
    })
  );

  if (!routeMatch) {
    return {
      scrubbedPath: '/invalid',
      pathLabel: 'invalid path',
    };
  }

  const scrubbedPathData = {
    scrubbedPath: pathname,
    pathLabel: routeMatch.label,
  };

  for (const route of routesToSanitize) {
    if (!!matchPath(pathname, { path: route })) {
      scrubbedPathData.scrubbedPath = route;
      break;
    }
  }

  return scrubbedPathData;
}

export const routes: ReadonlyArray<Route> = [
  {
    path: '/',
    component: Home,
    label: 'Overview',
    exact: true,
    showInNav: true,
  },
  {
    path: '/auth',
    component: Auth,
    label: 'Authentication',
    exact: false,
    showInNav: true,
  },
  {
    path: '/extensions',
    component: ExtensionsRoute,
    label: 'Extensions',
    exact: false,
    showInNav: true,
  },
  {
    path: '/firestore',
    component: Firestore,
    label: 'Firestore',
    exact: false,
    showInNav: true,
  },
  {
    path: '/database',
    component: Database,
    label: 'Realtime Database',
    exact: false,
    showInNav: true,
  },
  {
    path: '/storage',
    component: Storage,
    label: 'Storage',
    exact: false,
    showInNav: true,
  },
  {
    path: '/logs',
    component: LogsViewer as any,
    label: 'Logs',
    exact: true,
    showInNav: true,
  },
];
