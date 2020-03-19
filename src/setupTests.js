require('jest-fetch-mock').enableMocks();
require('mutationobserver-shim');

import * as base from '@rmwc/base';

// <AppBar> calls window.scrollTo which jsdom does not implement. Let's mock it
// out to silence warnings -- we don't actually need to test it.
Object.defineProperty(window, 'scrollTo', { value: () => {}, writable: true });

// RMWC's randomId is rewritten when NODE_ENV=='test' for Storybook reasons.
// Our tests require that this randomId method is not overwritten. For example,
// labels are assigned to an element with a random-id, but if all inputs have
// the same ID then all inputs will use the first found label as opposed to its
// own label.
base.randomId = prefix =>
  `${prefix}-${(Math.random() + Math.random() + 1).toString(36).substring(2)}`;
