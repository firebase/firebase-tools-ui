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

import { randomUUID } from 'crypto';

import { render, waitForElementToBeRemoved } from '@testing-library/react';
import { Database, ref, set } from 'firebase/database';
import { uniqueId } from 'lodash';
import React, { Suspense, useEffect, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useDatabase } from 'reactfire';

import { makeDeferred } from '../../../test_utils';
import { TestEmulatorConfigProvider } from '../../common/EmulatorConfigProvider';
import { DatabaseEmulatedApiProvider } from '../DatabaseEmulatedApiProvider';

interface RenderOptions {
  path?: string;
  state?: Partial<unknown>;
  namespace?: string;
}

export const renderWithDatabase = async (
  children: (database: Database) => Promise<React.ReactElement>,
  { path = '', state, namespace = 'default' }: RenderOptions = {}
) => {
  const errorDeferred = makeDeferred();
  const realPath = `/database/${namespace}/data/${path}`;
  const component = render(
    <MemoryRouter initialEntries={[realPath]}>
      <DatabaseTestProviders namespace={namespace} path={path} state={state}>
        <AsyncDatabase
          r={children}
          onError={(e) => errorDeferred.reject(e)}
        ></AsyncDatabase>
      </DatabaseTestProviders>
    </MemoryRouter>
  );

  await Promise.race([
    errorDeferred.promise,
    component.findByTestId(
      ASYNC_DATABASE_WRAPPER_TEST_ID,
      {},
      {
        // Some test setup can take longer than default 1000ms (esp. cold starts).
        timeout: 5000,
      }
    ),
  ]);

  return component;
};

export const DatabaseTestProviders: React.FC<
  React.PropsWithChildren<RenderOptions>
> = React.memo(({ namespace, children }) => {
  namespace = `${namespace}-${randomUUID()}`;
  const projectId = `${process.env.GCLOUD_PROJECT}-${Date.now()}`;
  const hostAndPort = process.env.FIREBASE_DATABASE_EMULATOR_HOST;
  if (!projectId || !hostAndPort) {
    throw new Error('DatabaseTestProviders requires a running Emulator');
  }
  const [host, port] = hostAndPort.split(':');

  return (
    <TestEmulatorConfigProvider
      config={{
        projectId,
        database: { host, port: Number(port), hostAndPort },
      }}
    >
      <DatabaseEmulatedApiProvider namespace={namespace}>
        <Suspense fallback={<h1 data-testid="fallback">Fallback</h1>}>
          {children}
        </Suspense>
      </DatabaseEmulatedApiProvider>
    </TestEmulatorConfigProvider>
  );
});

const ASYNC_DATABASE_WRAPPER_TEST_ID = 'AsyncDatabase-wrapper';

const AsyncDatabase: React.FC<
  React.PropsWithChildren<{
    r: (database: Database) => Promise<React.ReactElement>;
    onError: (e: Error) => void;
  }>
> = React.memo(({ r, onError }) => {
  const database = useDatabase();
  const [databaseChildren, setDatabaseChildren] =
    useState<React.ReactElement | null>(null);

  useEffect(() => {
    r(database)
      .then((c) => setDatabaseChildren(c))
      .catch(onError);
  }, [r, database, setDatabaseChildren]);

  return databaseChildren ? (
    <div data-testid={ASYNC_DATABASE_WRAPPER_TEST_ID}>{databaseChildren}</div>
  ) : null;
});
