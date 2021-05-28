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

import { renderHook } from '@testing-library/react-hooks';
import { createMemoryHistory } from 'history';
import React, { Suspense } from 'react';
import { Route, Router } from 'react-router-dom';

import { storagePath } from '../common/constants';
import { mockBuckets } from '../testing/mockBuckets';
import { TestStorageProvider } from '../testing/TestStorageProvider';
import { useBuckets } from './useBuckets';

const initialBucketName = 'pirojok-the-bucket';
const buckets = ['blinchik', 'pelmeni'];

describe('useBuckets', () => {
  async function setup() {
    const history = createMemoryHistory({
      initialEntries: ['/storage/' + initialBucketName],
    });

    mockBuckets(buckets);
    const Wrapper: React.FC = ({ children }) => {
      return (
        <Router history={history}>
          <Route exact path={storagePath + `:bucket/:path*`}>
            <TestStorageProvider>
              <Suspense fallback={'lol'}>{children}</Suspense>
            </TestStorageProvider>
          </Route>
        </Router>
      );
    };
    const { result, waitForNextUpdate } = renderHook(() => useBuckets(), {
      wrapper: Wrapper,
    });

    await waitForNextUpdate();

    return { buckets: result.current };
  }

  it('combines buckets from server and from URL', async () => {
    const { buckets } = await setup();
    expect(buckets).toEqual(['blinchik', 'pelmeni', initialBucketName]);
  });
});
