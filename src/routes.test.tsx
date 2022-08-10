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

import { scrubPathData } from './routes';

describe('getSanitizedPathData', () => {
  describe('Invalid routes', () => {
    it('Sets an invalid route correctly', () => {
      expect(scrubPathData('/IDoNotExist')).toEqual({
        scrubbedPath: '/invalid',
        pathLabel: 'invalid path',
      });
    });
  });

  describe('Auth', () => {
    it('scrubs the tenant ID', () => {
      expect(scrubPathData('/auth/myCoolTenant')).toEqual({
        scrubbedPath: '/auth/:tenantId',
        pathLabel: 'Authentication',
      });
    });
  });

  describe('Firestore', () => {
    it('scrubs Firestore path data', () => {
      expect(scrubPathData('/firestore/data/myCollection/myDoc')).toEqual({
        scrubbedPath: '/firestore/data/:path*',
        pathLabel: 'Firestore',
      });
    });

    it('scrubs deeply nested Firestore paths', () => {
      expect(
        scrubPathData(
          '/firestore/data/myCollection/myDoc/mySubCollection/mySubDoc'
        )
      ).toEqual({
        scrubbedPath: '/firestore/data/:path*',
        pathLabel: 'Firestore',
      });
    });

    it('scrubs Firestore request path data', () => {
      expect(scrubPathData('/firestore/requests/myRequest')).toEqual({
        scrubbedPath: '/firestore/requests/:requestId',
        pathLabel: 'Firestore',
      });
    });
  });

  describe('Realtime Database', () => {
    it('scrubs the namespace and path', () => {
      expect(scrubPathData('/database/myNamespace/data/users/userId')).toEqual({
        scrubbedPath: '/database/:namespace/data/:path*',
        pathLabel: 'Realtime Database',
      });
    });
  });

  describe('Extensions', () => {
    it('scrubs the namespace and path', () => {
      expect(scrubPathData('/extensions/my-cool-extension')).toEqual({
        scrubbedPath: '/extensions/:instanceId',
        pathLabel: 'Extensions',
      });
    });
  });

  describe('Storage', () => {
    it('scrubs the bucket name and path', () => {
      expect(scrubPathData('/storage/myBucket/some/secret/file')).toEqual({
        scrubbedPath: '/storage/:bucket/:path*',
        pathLabel: 'Storage',
      });
    });
  });

  describe('Valid routes that do not need to be sanitized', () => {
    it('leaves the pathname alone', () => {
      expect(scrubPathData('/logs')).toEqual({
        scrubbedPath: '/logs',
        pathLabel: 'Logs',
      });
    });
  });
});
