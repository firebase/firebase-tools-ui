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

import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';

import { AppState } from '../../store';
import { LogState } from '../../store/logviewer';
import { CompiledGetterCache } from './CompiledGetterCache';
import { HighlightedJSON } from './HighlightedJSON';
import { ParsedQuery, filtersToQueryString, isQueryMatch } from './QueryBar';

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  const segments = [date.getHours(), date.getMinutes(), date.getSeconds()];

  return segments
    .map(segment => {
      const number = segment.toString();

      if (number.length === 2) return number;
      else return `0${number}`;
    })
    .join(':');
};

interface PropsFromAttributes {
  parsedQuery: ParsedQuery;
  setQuery: (query: string) => void;
  compiledGetters: CompiledGetterCache;
}

interface PropsFromState {
  log: LogState;
}

type Props = PropsFromState & PropsFromAttributes;

export const History: React.FC<Props> = ({
  parsedQuery,
  setQuery,
  log,
  compiledGetters,
}) => {
  const history = log.history.filter(log =>
    isQueryMatch(parsedQuery, log, compiledGetters)
  );

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef && messagesEndRef.current) {
      (messagesEndRef.current as any).scrollIntoView();
    }
  };

  useEffect(scrollToBottom, [history]);

  const appendToQuery = (key: string, value: string) => {
    setQuery(filtersToQueryString({ ...parsedQuery.filters, [key]: value }));
  };

  return (
    <div id="log-history">
      {history.length ? (
        history.map((log, index) => (
          <div id={`log_${index}`} className="log-entry" key={index}>
            <span className="log-timestamp">
              {formatTimestamp(log.timestamp)}
            </span>
            <span
              className={`log-level ${log.level}`}
              onClick={() => appendToQuery('level', log.level)}
            >
              {log.level[0].toUpperCase()}
            </span>

            {Object.keys(log.data && log.data.user ? log.data.user : {})
              .length || log.data.user ? (
              <>
                <div className="log-message-single">{log.message}</div>
                <input
                  className="log-toggle"
                  type="checkbox"
                  defaultChecked={true}
                />
                <div className="log-data-rich">
                  <HighlightedJSON
                    data={log.data.user}
                    appendToQuery={appendToQuery}
                    compiledGetters={compiledGetters}
                  />
                </div>
              </>
            ) : log.message.split('\n').length === 1 ? (
              <div className="log-message-single">{log.message}</div>
            ) : (
              <>
                <div className="log-message-single">
                  {log.message.split('\n')[0]}
                </div>
                <div className="log-message-multi">
                  <pre>{log.message}</pre>
                </div>
              </>
            )}
          </div>
        ))
      ) : (
        <div id="log-history-empty">
          No logs are found which match your filters.
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export const mapStateToProps = ({ log }: AppState) => ({ log });
export const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(History);
