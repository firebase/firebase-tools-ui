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

import DatabaseDefaultRoute from './components/Database/DatabaseDefaultRoute';
import Firestore from './components/Firestore';
import Home from './components/Home';

export interface Route {
  path: string;
  component: React.FC;
  label: string;
  exact: boolean;
  showInNav: boolean;
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
    path: '/database',
    component: DatabaseDefaultRoute,
    label: 'RTDB',
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
];
