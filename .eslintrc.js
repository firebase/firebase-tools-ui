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

const restrictedGlobals = require('confusing-browser-globals');

module.exports = {
  extends: [
    'react-app',
    'plugin:jest/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['jest'],
  rules: {
    'jest/no-jasmine-globals': 'error',
    'no-restricted-globals': [
      'error',
      {
        // Our setup does not use global var gtag (declared by @types/gtag.js).
        name: 'gtag',
        message: "Use `import { gtag } from './analytics';` instead.",
      },
    ].concat(restrictedGlobals),
  },
};
