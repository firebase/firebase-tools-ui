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

import '../../LogViewer/index.scss';

import { GridCell } from '@rmwc/grid';
import React, { useEffect, useState } from 'react';

import { ReconnectingWebSocket } from '../../../reconnectingWebSocket';
import { useConfigOptional } from '../../common/EmulatorConfigProvider';
import { CompiledGetterCache } from '../../LogViewer/CompiledGetterCache';
import History from '../../LogViewer/History';
import { parseQuery } from '../../LogViewer/QueryBar';
import { LogEntry } from '../../LogViewer/types';
import styles from './FirealertsForm.module.scss';

const compiledGetters = new CompiledGetterCache();

export const LogViewer: React.FC<React.PropsWithChildren<unknown>> = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // This component does not suspend. Show empty logs on start and keep previous
  // logs when emulator stops.
  const config = useConfigOptional()?.logging;

  useEffect(() => {
    if (!config) return;

    setLogs([]);

    const protocol = document.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const webSocket = new ReconnectingWebSocket(
      `${protocol}//${config.hostAndPort}`
    );
    webSocket.listener = (log: LogEntry) => {
      setLogs((logs) => [...logs, log]);
    };
    return () => webSocket.cleanup();
  }, [config, setLogs]);

  const parsedQuery = parseQuery('metadata.emulator.name="functions"');

  return (
    <GridCell span={12}>
      <div className={styles.FirealertsLog}>
        <History
          parsedQuery={parsedQuery}
          setQuery={() => {}}
          compiledGetters={compiledGetters}
          logs={logs}
        />
      </div>
    </GridCell>
  );
};

export default LogViewer;
