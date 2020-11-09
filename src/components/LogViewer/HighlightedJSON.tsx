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
import './HighlightedJSON.scss';

import React from 'react';

import { CompiledGetterCache } from './CompiledGetterCache';

export enum HierarchyReferenceMode {
  NONE,
  DOT,
  BRACKET,
  INCREMENT,
}

export interface HierarchyReference {
  mode: HierarchyReferenceMode;
  key: number | string;
}

const toHierarchyStep = (key: string) => {
  if (key.match(/^[A-Z|_]+$/i)) {
    return {
      mode: HierarchyReferenceMode.DOT,
      key,
    };
  } else {
    return {
      mode: HierarchyReferenceMode.BRACKET,
      key,
    };
  }
};

const toHierarchyJS = (hierarchy: HierarchyReference[]) =>
  hierarchy
    .map(ref => {
      switch (ref.mode) {
        case HierarchyReferenceMode.NONE:
          return ref.key;
        case HierarchyReferenceMode.BRACKET:
          return `["${ref.key}"]`;
        case HierarchyReferenceMode.DOT:
          return `.${ref.key}`;
        case HierarchyReferenceMode.INCREMENT:
          return `[${JSON.stringify(ref.key)}]`;
      }

      return '';
    })
    .join('');

export interface Props {
  data: object;
  appendToQuery: (key: string, value: string) => void;
  compiledGetters: CompiledGetterCache;
}

export const HighlightedJSON: React.FC<Props> = ({
  data,
  appendToQuery,
  compiledGetters,
}) => {
  const lines = JSON.stringify(data, null, 2).split('\n');

  if (lines.length === 1)
    return <div className="log-message-single">{data}</div>;

  let isObject = false;

  let hierarchy: HierarchyReference[] = [
    {
      mode: HierarchyReferenceMode.NONE,
      key: 'user',
    },
  ];

  const pluck = (obj: any, path: string) => {
    return compiledGetters.getOrCompile(path, { user: obj });
  };

  const elements = lines.map((line, index) => {
    const quote_count = line.split('"').length - 1;

    const isStart = index === 0 && line.startsWith('{');
    const isEnd = index === lines.length - 1 && line.endsWith('}');

    const isEmptyArray = line.endsWith('[]') || line.endsWith('[],');
    const isEmptyObj = line.endsWith('{}') || line.endsWith('{},');

    const isKeyedObjStart =
      quote_count >= 2 && (line.endsWith('{') || isEmptyObj);
    const isKeyedArrayStart =
      quote_count >= 2 && (line.endsWith('[') || isEmptyArray);

    const isKeylessArrayStart =
      !isKeyedArrayStart && (line.endsWith('[') || isEmptyArray);
    const isKeylessObjStart =
      !isKeylessArrayStart && (line.endsWith('{') || isEmptyObj);

    const isLiteral =
      !line.endsWith('[') &&
      !line.endsWith('{') &&
      !line.endsWith('}') &&
      !line.endsWith('},');

    const isObjEnd = line.endsWith('}') || line.endsWith('},');
    const isArrayEnd = line.endsWith(']') || line.endsWith('],');

    if (isStart) {
      isObject = true;
      return (
        <div key={index} className="line start">
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

    if (isKeylessObjStart || isKeylessArrayStart || isLiteral) {
      const ref = hierarchy[hierarchy.length - 1];
      if (ref.mode === HierarchyReferenceMode.INCREMENT) {
        (ref as any).key += 1;
      }
    }

    if (isKeylessObjStart) {
      hierarchy.push({ mode: HierarchyReferenceMode.NONE, key: '' });
    }

    if (isKeylessArrayStart) {
      hierarchy.push({ mode: HierarchyReferenceMode.NONE, key: '' });
      hierarchy.push({ mode: HierarchyReferenceMode.INCREMENT, key: -1 });
    }

    if (isKeyedObjStart || isKeyedArrayStart) {
      const [start, ...splat] = line.split(':');
      const [indent, ...key_chunks] = start.split('"');
      const key = key_chunks.filter((v: string) => v).join('"');
      const value = splat.join(':');

      hierarchy.push(toHierarchyStep(key));
      const hierarchy_chain = toHierarchyJS(hierarchy);

      if (isKeyedArrayStart) {
        hierarchy.push({ mode: HierarchyReferenceMode.INCREMENT, key: -1 });
      }

      if (isArrayEnd) {
        hierarchy.pop(); // Remove reference with array name (i.e. "users")
        hierarchy.pop(); // Remove reference with array index (i.e. 3)
      }

      if (isObjEnd) {
        hierarchy.pop();
      }

      return (
        <div key={index} className="line object-start">
          {indent}
          <div
            className="clickable key"
            onClick={() => appendToQuery(hierarchy_chain, '*')}
          >
            "{key}"
          </div>
          :{value}
        </div>
      );
    }

    if (isObjEnd) {
      if (
        hierarchy[hierarchy.length - 1].mode !==
        HierarchyReferenceMode.INCREMENT
      ) {
        hierarchy.pop();
      }
      return (
        <div key={index} className="line object-end">
          {line}
        </div>
      );
    }

    if (isArrayEnd) {
      hierarchy.pop(); // Remove reference with array name (i.e. "users")
      hierarchy.pop(); // Remove reference with array index (i.e. 3)

      return (
        <div key={index} className="line array-end">
          {line}
        </div>
      );
    }

    if (isLiteral) {
      if (!isObject) {
        return (
          <div key={index} className="line literal">
            <div className="value clickable">{line}</div>
          </div>
        );
      }

      const [start, ...splat] = line.split(':');
      const key_chunks = start.split('"').slice(1);
      const key = key_chunks.filter((v: string) => v).join('"');
      const value = splat.join(':').trim();

      const new_indent = new Array(line.length - line.trim().length + 1).join(
        ' '
      );
      if (key && value) {
        const hierarchy_chain = toHierarchyJS([
          ...hierarchy,
          toHierarchyStep(key),
        ]);
        return (
          <div key={index} className="line literal">
            {new_indent}
            <div
              className="key clickable"
              onClick={() => appendToQuery(hierarchy_chain, '*')}
            >
              "{key}"
            </div>
            :{' '}
            <div
              className="clickable value"
              onClick={() =>
                appendToQuery(hierarchy_chain, pluck(data, hierarchy_chain))
              }
            >
              {value}
            </div>
          </div>
        );
      } else {
        const hierarchy_chain = toHierarchyJS(hierarchy);
        return (
          <div key={index} className="line literal">
            {new_indent}
            <div
              className="clickable value"
              onClick={() =>
                appendToQuery(hierarchy_chain, pluck(data, hierarchy_chain))
              }
            >
              {line.trim()}
            </div>
          </div>
        );
      }
    }

    return (
      <div key={index} className={`line generic`}>
        {line}
      </div>
    );
  });

  return <div className="HighlightedJSON">{elements}</div>;
};
