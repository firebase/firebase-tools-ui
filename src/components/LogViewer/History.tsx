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

import './History.scss';

import { ThemeProvider } from '@rmwc/theme';
import React, { useEffect, useRef } from 'react';

import { grey100 } from '../../colors';
import { CompiledGetterCache } from './CompiledGetterCache';
import { HighlightedJSON } from './HighlightedJSON';
import { ParsedQuery, filtersToQueryString, isQueryMatch } from './QueryBar';
import { LogEntry } from './types';

const FilterTag: React.FC<{ appendToQuery: Function; log: LogEntry }> = ({
  appendToQuery,
  log,
}) => {
  const metadata = log.data.metadata;
  let tagButton;

  if (metadata?.function?.name) {
    tagButton = (
      <div
        className="log-tag-button"
        onClick={() =>
          appendToQuery('metadata.function.name', metadata.function?.name)
        }
      >
        function[{metadata.function.name}]
      </div>
    );
  } else if (metadata?.emulator?.name) {
    tagButton = (
      <div
        className="log-tag-button"
        onClick={() =>
          appendToQuery('metadata.emulator.name', metadata.emulator?.name)
        }
      >
        {metadata.emulator.name}
      </div>
    );
  }

  return <div className="log-tag">{tagButton}</div>;
};

interface Props {
  parsedQuery: ParsedQuery;
  setQuery: (query: string) => void;
  compiledGetters: CompiledGetterCache;
  logs: LogEntry[];
}

const MAX_LOG_LINES = 100;

export const History: React.FC<Props> = ({
  parsedQuery,
  setQuery,
  logs,
  compiledGetters,
}) => {
  const history = logs.filter((log) =>
    isQueryMatch(parsedQuery, log, compiledGetters)
  );

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef && messagesEndRef.current) {
      (messagesEndRef.current as any).scrollIntoView?.();
    }
  };

  useEffect(scrollToBottom, [history]);

  const appendToQuery = (key: string, value: string) => {
    setQuery(filtersToQueryString({ ...parsedQuery.filters, [key]: value }));
  };

  const getUserData = (log: LogEntry) =>
    log?.data?.user && Object.keys(log?.data?.user).length;

  return (
    <ThemeProvider options={{ surface: grey100 }} className="LogHistory">
      {history.length ? (
        history.slice(-MAX_LOG_LINES).map((log, index) => (
          <div id={`log_${index}`} className="log-entry" key={index}>
            <span className="log-timestamp">
              {new Date(log.timestamp).toLocaleTimeString('en-US', {
                hour12: false,
              })}
            </span>
            <span
              className={`log-level ${log.level}`}
              onClick={() => appendToQuery('level', log.level)}
            >
              {log.level[0].toUpperCase()}
            </span>
            <FilterTag appendToQuery={appendToQuery} log={log} />
            {getUserData(log) ? (
              <HighlightedJSON
                data={log.data.user}
                appendToQuery={appendToQuery}
                compiledGetters={compiledGetters}
              />
            ) : (
              <div className="log-message-single">{log.message}</div>
            )}
          </div>
        ))
      ) : (
        <div className="LogHistoryEmpty">
          No logs are found which match your filters.
        </div>
      )}
      <div ref={messagesEndRef} />
    </ThemeProvider>
  );
};

export default History;
