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

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { AppState } from '../../store';
import { LoggingConfig } from '../../store/config';
import { LogEntry, LogState } from '../../store/logviewer';
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
}

export type Props = PropsFromState & PropsFromDispatch;

const compiledGetters = new CompiledGetterCache();

export const LogViewer: React.FC<Props> = ({ logReceived, config }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!config) return;

    const webSocket = new ReconnectingWebSocket(config);
    webSocket.listener = (log: LogEntry) => {
      //todo: remove hack to cut off icon
      log.message = log.message
        .split(' ')
        .slice(1)
        .join(' ');
      logReceived(log);

      return () => {
        webSocket.listener = undefined;
      };
    };
  }, [config, logReceived]);

  const parsedQuery = parseQuery(query);

  return (
    <div
      id="log"
      className="mdc-layout-grid__cell mdc-layout-grid__cell--span-12 mdc-elevation--z2"
    >
      <QueryBar
        query={query}
        parsedQuery={parsedQuery}
        setQuery={setQuery}
        compiledGetters={compiledGetters}
      />
      <History
        parsedQuery={parsedQuery}
        setQuery={setQuery}
        compiledGetters={compiledGetters}
      />
    </div>
  );
};

export const mapStateToProps = ({ config }: AppState) => {
  return {
    config: hasData(config.result) ? config.result.data.logging : undefined,
  };
};
export const mapDispatchToProps = {
  logReceived(log: LogEntry) {
    return { type: '@log/RECEIVED', payload: log };
  },
};

export default connect(mapStateToProps, mapDispatchToProps)(LogViewer);
