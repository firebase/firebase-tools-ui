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
import './QueryBar.scss';

import { Button } from '@rmwc/button';
import React, { useEffect, useState } from 'react';

import { LogEntry } from '../../store/logviewer';
import { CompiledGetterCache } from './CompiledGetterCache';

export const filtersToQueryString = (filters: {
  [key: string]: string | number;
}) => {
  const formattedQueryLines = [];
  for (const key in filters) {
    formattedQueryLines.push(`${key}=${JSON.stringify(filters[key])}`);
  }
  return formattedQueryLines.sort().join('\n');
};

export const isQueryMatch = (
  query: { filters: { [key: string]: string } },
  log: LogEntry,
  compiledGetters: CompiledGetterCache
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
        fieldPath.startsWith('metadata.') ||
        fieldPath.startsWith('user[') ||
        fieldPath.startsWith('metadata[')
      ) {
        fieldPath = `data.${fieldPath}`;
      }

      const fieldValue = query.filters[originalFieldPath];
      const value = compiledGetters.getOrCompile(fieldPath, log);
      if (
        !value ||
        (fieldValue !== undefined &&
          fieldValue !== '*' &&
          fieldValue.toString() !== value.toString())
      ) {
        return false;
      }
    }
  }

  return true;
};

export interface ParsedQuery {
  elements: JSX.Element[];
  filters: { [key: string]: string };
}

const queryFields = [
  'level',
  'search',
  'metadata.emulator',
  'metadata.emulator.name',
  'metadata.function',
  'metadata.function.name',
];
export function parseQuery(query: string): ParsedQuery {
  let escapedQuery = '';
  let isEscaped = false;

  for (const char of query) {
    if (isEscaped) {
      escapedQuery += 'ˍ';
      isEscaped = false;
    } else {
      escapedQuery += char;

      if (char === '\\') {
        isEscaped = true;
      }
    }
  }

  const quoted_query = escapedQuery
    .split('"')
    .map((t, i) => (i % 2 ? t.replace(/ /g, 'ˍ') : t))
    .join('"');

  const sections: string[] = quoted_query
    .split('\n')
    .reduce((sections, line) => {
      return [
        ...sections,
        ...line.split(/((?:[^\s]+)\s?=\s?(?:[^\s]+))/),
        '\n',
      ];
    }, [] as string[]);

  const filters: { [key: string]: string } = {};
  const queryChunks: string[] = [];

  let position = 0;
  const elements = sections.map((quoted_section, index) => {
    const section = query.slice(position, position + quoted_section.length);
    position += quoted_section.length;

    const equalPosition = section.indexOf('=');
    const isKeyPair =
      equalPosition > -1 && section[0] !== '=' && section.slice(-1)[0] !== '=';
    const isNewline = section === '\n';

    if (isNewline) {
      return <br key={index} />;
    }
    if (!isKeyPair) {
      queryChunks.push(section);
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
    queryChunks
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

interface Props {
  query: string;
  setQuery: (query: string) => void;
  compiledGetters: CompiledGetterCache;
}

export const QueryBar: React.FC<Props> = ({ query, setQuery }) => {
  const [temporaryQuery, setTemporaryQuery] = useState('');

  useEffect(() => {
    setTemporaryQuery(query);
  }, [query]);

  const parsedQuery = parseQuery(temporaryQuery);

  return (
    <div className="QueryBar">
      <div className="QueryBar-render">{parsedQuery.elements}</div>
      <textarea
        rows={1}
        className="QueryBar-input"
        spellCheck={false}
        value={temporaryQuery}
        onChange={e => setTemporaryQuery((e.target as any).value)}
        placeholder="Filter or search logs..."
      ></textarea>
      <div className="QueryBar-actions">
        <Button
          unelevated
          onClick={() => setQuery(temporaryQuery)}
          disabled={query === temporaryQuery}
        >
          Apply
        </Button>
        <Button
          unelevated
          disabled={!temporaryQuery.length}
          onClick={() => {
            setTemporaryQuery('');
            setQuery('');
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};
