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
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { AppState } from '../../store';
import { LoggingConfig } from '../../store/config';
import {
  LogEntry,
  LogState,
  logReceived,
  logReset,
} from '../../store/logviewer';
import { hasData } from '../../store/utils';
import { CompiledGetterCache } from './CompiledGetterCache';
import History from './History';
import { QueryBar, parseQuery } from './QueryBar';
import { ReconnectingWebSocket } from './ReconnectingWebSocket';

interface PropsFromState {
  log: LogState;
  config?: LoggingConfig;
}

interface PropsFromDispatch {
  logReceived: Function;
  logReset: () => void;
}

export type Props = PropsFromState & PropsFromDispatch;

const compiledGetters = new CompiledGetterCache();

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export const LogViewer: React.FC<Props> = ({
  logReceived,
  logReset,
  config,
}) => {
  const qs = useQuery();
  const [query, setQuery] = useState(qs.get('q') || '');

  useEffect(() => {
    if (!config) return;

    logReset();
    const webSocket = new ReconnectingWebSocket(config);
    webSocket.listener = (log: LogEntry) => {
      logReceived(log);
    };
    return () => webSocket.cleanup();
  }, [config, logReceived, logReset]);

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
          />
        </Card>
      </Elevation>
    </GridCell>
  );
};

export const mapStateToProps = ({ config }: AppState) => {
  return {
    config: hasData(config.result) ? config.result.data.logging : undefined,
  };
};
export const mapDispatchToProps = {
  logReceived,
  logReset,
};

export default connect(mapStateToProps, mapDispatchToProps)(LogViewer);
