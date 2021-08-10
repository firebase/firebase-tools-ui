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

import { Button } from '@rmwc/button';
import { Card } from '@rmwc/card';
import { Elevation } from '@rmwc/elevation';
import { GridCell } from '@rmwc/grid';
import React, { useState } from 'react';
import useSwr from 'swr';

import { DatabaseConfig } from '../../store/config';
import { Callout } from '../common/Callout';
import { useEmulatorConfig } from '../common/EmulatorConfigProvider';
import DatabasePicker from './DatabasePicker';

export type Props = {
  children?: React.ReactNode;
  databases: string[] | undefined;
  current: string;
  primary: string;
  navigation: (db: string) => string;
};

export const DatabaseContainer: React.FC<Props> = ({
  current,
  primary,
  navigation,
  databases,
  children,
}) => {
  const [dbs, setDbs] = useState(databases);

  let hasNewDbs = false;
  if (databases !== dbs) {
    if (
      dbs === undefined ||
      databases === undefined ||
      dbs.join('|') === databases.join('|') // databases are sorted
    ) {
      // Don't show reload button for initial data or unchanged.
      setDbs(databases);
    } else {
      hasNewDbs = true;
    }
  }

  return (
    <>
      <GridCell span={12} className="Database-Container">
        {hasNewDbs && (
          <Callout
            icon="info"
            actions={
              <Button theme="secondary" onClick={() => setDbs(databases)}>
                Reload
              </Button>
            }
          >
            There are new databases that have been created. Reload the page to
            view them.
          </Callout>
        )}
        <Elevation z={2} wrap>
          <Card className="canvas-card">
            <div className="Database">
              <DatabasePicker
                current={current}
                primary={primary}
                navigation={navigation}
                databases={dbs}
              />
              {children}
            </div>
          </Card>
        </Elevation>
      </GridCell>
    </>
  );
};

export const DatabaseContainerWrapper: React.FC<Omit<Props, 'databases'>> = (
  props
) => {
  const config = useEmulatorConfig('database');
  const { data } = useSwr(
    // Put config object in cache key (compared shallowly) so databases will
    // be cleared on emulator restart as expected (even if ports don't change).
    ['/dummy/database/databases', config, props.primary],
    fetchDatabases,
    { refreshWhenOffline: true, initialData: undefined, refreshInterval: 5000 }
  );
  return <DatabaseContainer databases={data} {...props} />;
};

export interface DatabaseInfo {
  name: string;
}

async function fetchDatabases(
  _: string, // dummy path parameter, unused for actual fetching
  config: DatabaseConfig,
  primary: string
): Promise<string[]> {
  const res = await fetch(
    `http://${config.hostAndPort}/.inspect/databases.json?ns=${primary}`
  );
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  const databaseInfos: DatabaseInfo[] = await res.json();

  // Sort databases by name to avoid unnecessary "changes".
  return databaseInfos.map((db) => db.name).sort();
}

export default DatabaseContainerWrapper;
