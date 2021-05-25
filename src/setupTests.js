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

import * as base from '@rmwc/base';

require('mutationobserver-shim');

// reactFire has an implicit dependency on globalThis
// https://github.com/FirebaseExtended/reactfire/blob/b82b58a8146eb044321244005f9d0eeeaf2be9e1/README.md#install
global.globalThis = require('globalthis')();

// <AppBar> calls window.scrollTo, which jsdom does not implement. Let's mock it
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

// CodeMirror calls document.createRange, which jsdom does not implement.
// Mocking this function is necessary in order to test components
// that render the CodeMirror component.
// References:
//    https://github.com/scniro/react-codemirror2/issues/23
//    https://github.com/jsdom/jsdom/issues/3002
global.document.createRange = () => {
  return {
    setEnd: jest.fn(),
    setStart: jest.fn(),
    getBoundingClientRect: jest.fn(),
    getClientRects: () => {
      return {
        item: () => null,
        length: 0,
        [Symbol.iterator]: jest.fn(),
      };
    },
  };
};

// Since jsdom does not implement navigator to copy to clipboard,
// mocking this is necessary to test components that copy to clipboard.
// NOTE: it returns a Promise that always resolves instantly
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: (text) => {
      return new Promise((resolve) => resolve(text));
    },
  },
});
