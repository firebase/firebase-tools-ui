/**
 * Copyright 2020 Google LLC
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

import './index.scss';

import { Card } from '@rmwc/card';
import { Elevation } from '@rmwc/elevation';
import { GridCell } from '@rmwc/grid';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { ReconnectingWebSocket } from '../../reconnectingWebSocket';
import { useConfigOptional } from '../common/EmulatorConfigProvider';
import { CompiledGetterCache } from './CompiledGetterCache';
import History from './History';
import { QueryBar, parseQuery } from './QueryBar';
import { LogEntry } from './types';

const compiledGetters = new CompiledGetterCache();

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export const LogViewer: React.FC = () => {
  const qs = useQuery();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [query, setQuery] = useState(qs.get('q') || '');

  // This component does not suspend. Show empty logs on start and keep previous
  // logs when emulator stops.
  const config = useConfigOptional()?.logging;

  useEffect(() => {
    if (!config) return;

    setLogs([]);
    const webSocket = new ReconnectingWebSocket(`ws://${config.hostAndPort}`);
    webSocket.listener = (log: LogEntry) => {
      setLogs((logs) => [...logs, log]);
    };
    return () => webSocket.cleanup();
  }, [config, setLogs]);

  const parsedQuery = parseQuery(query);

  return (
    <GridCell span={12}>
      <Elevation z={2} wrap>
        <Card className="LogViewer">
          <QueryBar
            query={query}
            setQuery={setQuery}
            compiledGetters={compiledGetters}
          />
          <History
            parsedQuery={parsedQuery}
            setQuery={setQuery}
            compiledGetters={compiledGetters}
            logs={logs}
          />
        </Card>
      </Elevation>
    </GridCell>
  );
};

export default LogViewer;
