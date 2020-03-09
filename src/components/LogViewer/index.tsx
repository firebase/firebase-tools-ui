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

import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../store';
import { LogEntry, LogState } from '../../store/config';
import './index.scss';

enum WebSocketState {
  DISCONNECTED,
  CONNECTED,
  PENDING,
}

class ReconnectingWebSocket {
  state: WebSocketState = WebSocketState.DISCONNECTED;
  listener: Function | undefined = undefined;

  constructor() {
    this.connect();
    setInterval(this.connect.bind(this), 1000);
  }

  private connect() {
    if (this.state !== WebSocketState.DISCONNECTED) return;

    const ws = new WebSocket('ws://localhost:9999');
    this.state = WebSocketState.PENDING;

    ws.onopen = () => {
      this.state = WebSocketState.CONNECTED;
    };

    ws.onclose = () => {
      this.state = WebSocketState.DISCONNECTED;
    };

    ws.onmessage = msg => {
      const data = JSON.parse(msg.data);
      this.listener && this.listener(data);
    };
  }
}

class GetterCache {
  getters: { [path: string]: Function } = {};

  get(path: string, obj: any) {
    if (!this.getters[path]) {
      try {
        this.getters[path] = new Function('obj', 'return obj.' + path + ';');
      } catch (err) {
        console.warn(err);
        return undefined;
      }
    }

    try {
      return this.getters[path](obj);
    } catch (err) {
      return undefined;
    }
  }
}

export interface PropsFromState {
  log: LogState;
}

export interface PropsFromDispatch {
  logReceived: Function;
}

export type Props = PropsFromState & PropsFromDispatch;

const queryFields = ['level', 'function.name', 'search'];
function parseQuery(query: string) {
  let escaped_query = '';
  let is_escaped = false;

  for (const char of query) {
    if (is_escaped) {
      escaped_query += 'ˍ';
      is_escaped = false;
    } else {
      escaped_query += char;

      if (char === '\\') {
        is_escaped = true;
      }
    }
  }

  const quoted_query = escaped_query
    .split('"')
    .map((t, i) => (i % 2 ? t.replace(/ /g, 'ˍ') : t))
    .join('"');

  const sections: string[] = quoted_query.split('\n').reduce(
    (sections, line) => {
      return [
        ...sections,
        ...line.split(/((?:[^\s]+)\s?=\s?(?:[^\s]+))/),
        '\n',
      ];
    },
    [] as string[]
  );

  const filters: { [key: string]: string } = {};
  const query_chunks: string[] = [];

  let position = 0;
  const elements = sections.map((quoted_section, index) => {
    const section = query.slice(position, position + quoted_section.length);
    position += quoted_section.length;

    const equalPosition = section.indexOf('=');
    const isKeyPair =
      equalPosition > -1 && section[0] !== '=' && section.slice(-1)[0] !== '=';
    const isNewline = section === '\n';

    if (isNewline) return <br key={index} />;
    if (!isKeyPair) {
      query_chunks.push(section);
      return (
        <span key={index} className="text">
          {section}
        </span>
      );
    }

    const pairKey = section.split('=')[0].trim();
    if (
      isKeyPair &&
      queryFields.indexOf(pairKey) === -1 &&
      !(pairKey.startsWith('user.') || pairKey.startsWith('user['))
    ) {
      return (
        <span key={index}>
          <span className="invalid_pair">{section}</span>
        </span>
      );
    }

    const [key, value] = section.split('=');
    try {
      filters[key.trim()] = JSON.parse(value);
    } catch (err) {
      filters[key.trim()] = value;
    }
    return (
      <span key={index}>
        <span className="key">{key}=</span>
        <span className="value">{value}</span>
      </span>
    );
  });

  const search = [
    filters.search,
    query_chunks
      .filter(v => v)
      .join(' ')
      .trim(),
  ]
    .filter(v => v)
    .join(' ');

  if (search.length) filters.search = search;

  return {
    elements,
    filters,
  };
}

const rws = new ReconnectingWebSocket();
const getterCache = new GetterCache();

const formatQuery = (filters: { [key: string]: string }) => {
  const formatted_query_lines = [];
  for (const key in filters) {
    formatted_query_lines.push(`${key}=${JSON.stringify(filters[key])}`);
  }
  return formatted_query_lines.sort().join('\n');
};

const isQueryMatch = (
  query: { filters: { [key: string]: string } },
  log: LogEntry
) => {
  for (const originalFieldPath of Object.keys(query.filters)) {
    if (originalFieldPath === 'search') {
      const stringifedLog = JSON.stringify(log).toLowerCase();

      if (
        stringifedLog.indexOf(
          query.filters[originalFieldPath].toLowerCase()
        ) === -1
      ) {
        return false;
      }
    } else {
      let fieldPath = originalFieldPath;
      if (
        fieldPath.startsWith('user.') ||
        fieldPath.startsWith('system.') ||
        fieldPath.startsWith('user[') ||
        fieldPath.startsWith('system[')
      ) {
        fieldPath = `data.${fieldPath}`;
      }

      const fieldValue = query.filters[originalFieldPath];
      const value = getterCache.get(fieldPath, log);
      if (
        !value ||
        (fieldValue &&
          fieldValue !== '*' &&
          fieldValue.toString() !== value.toString())
      ) {
        return false;
      }
    }
  }

  return true;
};

const HighlightedJSON = ({
  data,
  appendToQuery,
}: {
  data: any;
  appendToQuery: Function;
}) => {
  const lines = JSON.stringify(data, null, 2).split('\n');

  let isObject = false;
  let hierarchy = ['user'];

  const toHierarchyStep = (key: string) =>
    key.match(/^[A-Z|_]+$/i) ? `.${key}` : `["${key}"]`;

  const pluck = (obj: any, hierarchy: string[]) => {
    const path = hierarchy.join('');
    return getterCache.get(path, { user: obj });
  };

  return (
    <div className="highlighted-json">
      {lines.map((line, index) => {
        const quote_count = line.split('"').length - 1;

        const isStart = index === 0 && line.startsWith('{');
        const isEnd = index === lines.length - 1 && line.endsWith('}');
        const isObjStart = quote_count >= 2 && line.endsWith('{');
        const isLiteral =
          !line.endsWith('{') && !line.endsWith('}') && !line.endsWith('},');
        const isObjEnd = line.endsWith('}') || line.endsWith('},');

        if (isStart) {
          isObject = true;
          return (
            <div key={index} className="line start" data-json-key="user">
              {line}
            </div>
          );
        }

        if (isEnd) {
          return (
            <div key={index} className="line end">
              {line}
            </div>
          );
        }

        if (isObjStart) {
          const [start, ...splat] = line.split(':');
          const [indent, ...key_chunks] = start.split('"');
          const key = key_chunks.filter((v: string) => v).join('"');
          const value = splat.join(':');
          hierarchy.push(toHierarchyStep(key));

          const hierarchy_chain = hierarchy.join('');

          return (
            <div key={index} className="line object-start" data-json-key={key}>
              {indent}
              <a
                href="#"
                className="key"
                onClick={() => appendToQuery(hierarchy_chain, '*')}
              >
                "{key}"
              </a>
              :{value}
            </div>
          );
        }

        if (isObjEnd) {
          hierarchy.pop();
          return (
            <div key={index} className="line object-end">
              {line}
            </div>
          );
        }

        if (isLiteral) {
          if (!isObject) {
            return (
              <div key={index} className="line literal">
                <a href="#" className="value">
                  {line}
                </a>
              </div>
            );
          }
          const [start, ...splat] = line.split(':');
          const [indent, ...key_chunks] = start.split('"');
          const key = key_chunks.filter((v: string) => v).join('"');
          const value = splat.join(':').trim();
          const local_hierarchy = [...hierarchy, toHierarchyStep(key)];
          const hierarchy_chain = local_hierarchy.join('');

          return (
            <div key={index} className="line literal" data-json-key={key}>
              {indent}
              <a
                href="#"
                className="key"
                onClick={() => appendToQuery(hierarchy_chain, '*')}
              >
                "{key}"
              </a>
              :{' '}
              <a
                href="#"
                className="value"
                onClick={() =>
                  appendToQuery(hierarchy_chain, pluck(data, local_hierarchy))
                }
              >
                {value}
              </a>
            </div>
          );
        }

        return (
          <div key={index} className={`line generic`}>
            {line}
          </div>
        );
      })}
    </div>
  );
};

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  const segments = [date.getHours(), date.getMinutes(),date.getSeconds()];

  return segments.map((segment) => {
    const number = segment.toString();

    if (number.length === 2) return number;
    else return `0${number}`;
  }).join(":")
};

export const LogViewer: React.FC<Props> = ({ log, logReceived }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    rws.listener = (log: LogEntry) => {
      //todo: remove hack to cut off icon
      log.message = log.message.split(" ").slice(1).join(" ");
      logReceived(log);
    };
  }, []);

  const parsed_query = parseQuery(query);
  const history = log.history.filter(log => isQueryMatch(parsed_query, log));

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef && messagesEndRef.current) {
      (messagesEndRef.current as any).scrollIntoView();
    }
  };

  useEffect(scrollToBottom, [history]);

  const appendToQuery = (key: string, value: string) => {
    setQuery(formatQuery({ ...parsed_query.filters, [key]: value }));
  };

  return (
    <div id="log">
      <div id="query">
        <div id="render">{parsed_query.elements}</div>
        <textarea
          rows={1}
          id="input"
          spellCheck={false}
          value={query}
          onChange={e => setQuery((e.target as any).value)}
          placeholder="Filter or search logs..."
        ></textarea>
        {query.length ? (
          <div id="actions">
            <button onClick={() => setQuery(formatQuery(parsed_query.filters))}>
              format
            </button>
            <button onClick={() => setQuery('')}>clear query</button>
          </div>
        ) : (
          ''
        )}
      </div>

      <div id="history">
        {history.length
          ? history.map((log, index) => (
              <div id={`log_${index}`} className="log-entry" key={index}>
                <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
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
                      />
                    </div>
                  </>
                ) : log.message.split('\n').length == 1 ? (
                  <div className="log-message-single">{log.message}</div>
                ) : (
                  <>
                    <div className="log-message-single">{log.message.split("\n")[0]}</div>
                  <div className="log-message-multi">
                    <pre>{log.message}</pre>
                  </div>
                  </>
                )}
              </div>
            ))
          : 'No logs found...'}
        <div ref={messagesEndRef} />
      </div>

      {/*<pre id="debug">{JSON.stringify(parsed_query.filters, undefined, 2)}</pre>*/}
    </div>
  );
};

export const mapStateToProps = ({ log }: AppState) => ({ log });
export const mapDispatchToProps = {
  logReceived(log: LogEntry) {
    return { type: '@log/RECEIVED', payload: log };
  },
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LogViewer);
