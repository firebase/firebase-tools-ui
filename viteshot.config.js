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

const playwrightShooter = require('viteshot/shooters/playwright');
const playwright = require('playwright');

module.exports = {
  framework: {
    type: 'react',
  },
  shooter: playwrightShooter(playwright.chromium),
  filePathPattern: '**/*.screenshot.@(js|jsx|tsx|vue|svelte)',
  wrapper: {
    path: 'src/testing/ScreenshotWrapper.tsx',
    componentName: 'ScreenshotWrapper',
  },
};
