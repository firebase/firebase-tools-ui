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

require('mutationobserver-shim');

// reactFire has an implicit dependency on globalThis
// https://github.com/FirebaseExtended/reactfire/blob/b82b58a8146eb044321244005f9d0eeeaf2be9e1/README.md#install
global.globalThis = require('globalthis')();

import * as base from '@rmwc/base';

// <AppBar> calls window.scrollTo which jsdom does not implement. Let's mock it
// out to silence warnings -- we don't actually need to test it.
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
});

// RMWC's randomId is rewritten when NODE_ENV=='test' for Storybook reasons.
// Our tests require that this randomId method is not overwritten. For example,
// labels are assigned to an element with a random-id, but if all inputs have
// the same ID then all inputs will use the first found label as opposed to its
// own label.
base.randomId = (prefix) =>
  `${prefix}-${(Math.random() + Math.random() + 1).toString(36).substring(2)}`;
