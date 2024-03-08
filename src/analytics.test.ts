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

import { _getPageConfig } from './analytics';

describe('Analytics', () => {
  describe('Page config', () => {
    it('Can determine the right analytics config for a page', () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:5173/firestore/default/data/myCollection/myDocument',
          pathname: '/firestore/default/data/myCollection/myDocument',
        },
        configurable: true,
      });

      expect(_getPageConfig()).toEqual({
        page_title: 'Firestore',
        page_location: 'http://redacted/firestore/:databaseId/data/:path*',
      });
    });

    it('scrubs the referrer host+port if the referrer is the emulator UI', () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:5173/firestore/default/data/myCollection/myDocument?search=5#heading',
          pathname: '/firestore/default/data/myCollection/myDocument',
          host: 'localhost:5173',
          hostname: 'localhost',
          port: '5173',
        },
        configurable: true,
      });
      Object.defineProperty(document, 'referrer', {
        value:
          'http://localhost:5173/firestore/default/requests/request2?search=5#heading',
        configurable: true,
      });

      expect(_getPageConfig()).toEqual({
        page_title: 'Firestore',
        page_location: 'http://redacted/firestore/:databaseId/data/:path*',
        page_referrer:
          'http://redacted/firestore/:databaseId/requests/:requestId',
      });
    });

    it('does not scrub the referrer host+port if the referrer is a different host', () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:5173/firestore/default/data/myCollection/myDocument',
          pathname: '/firestore/default/data/myCollection/myDocument',
          host: 'localhost:5173',
        },
        configurable: true,
      });
      Object.defineProperty(document, 'referrer', {
        value: 'https://github.com/firebase/firebase-tools',
        configurable: true,
      });

      expect(_getPageConfig()).toEqual({
        page_title: 'Firestore',
        page_location: 'http://redacted/firestore/:databaseId/data/:path*',
        page_referrer: 'https://github.com/firebase/firebase-tools',
      });
    });
  });
});
