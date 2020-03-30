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

import { CompiledGetterCache } from './CompiledGetterCache';
import { filtersToQueryString, isQueryMatch, parseQuery } from './QueryBar';

describe('filtersToQueryString', () => {
  it('should quote string values', () => {
    expect(
      filtersToQueryString({ hello: 'world', 'whats.up': 'firebase' })
    ).toBe(`hello="world"\nwhats.up="firebase"`);
  });

  it('should preserve numeric values', () => {
    expect(filtersToQueryString({ hello: 'world', 'whats.up': 0 })).toBe(
      `hello="world"\nwhats.up=0`
    );
  });
});

describe('parseQuery', () => {
  it('should parse valid query key pairs', () => {
    expect(parseQuery('level=info').filters).toStrictEqual({ level: 'info' });
  });

  it('should ignore invalid query key pairs', () => {
    expect(parseQuery('level=info evil=true').filters).toStrictEqual({
      level: 'info',
    });
  });

  it("should parse any pairs under 'user'", () => {
    expect(parseQuery('level=info user.cat=hat').filters).toStrictEqual({
      level: 'info',
      'user.cat': 'hat',
    });
  });

  it("should parse stray strings as 'search", () => {
    expect(parseQuery('whats level=info up').filters.search).toBe('whats   up');
  });

  it('should parse complex paths', () => {
    expect(parseQuery("user['...'].fish['\\asd']=1234").filters).toStrictEqual({
      "user['...'].fish['\\asd']": 1234,
    });
  });
});

describe('isQueryMatch', () => {
  let compiledGetters: CompiledGetterCache;
  const logEntryTemplate = {
    level: 'info',
    data: { user: {} },
    message: '',
    timestamp: new Date().getTime(),
  };

  beforeEach(() => {
    compiledGetters = new CompiledGetterCache();
  });

  it('should do fuzzy matching on search filter', () => {
    const log = { ...logEntryTemplate, message: 'I like vegan fishsticks' };
    expect(isQueryMatch(parseQuery('fish'), log, compiledGetters)).toBeTruthy();
    expect(
      isQueryMatch(parseQuery('chicken'), log, compiledGetters)
    ).toBeFalsy();
  });

  it('should do exact field matching', () => {
    const log = { ...logEntryTemplate, data: { user: { adorable: true } } };
    expect(
      isQueryMatch(parseQuery('user.adorable=true'), log, compiledGetters)
    ).toBeTruthy();
    expect(
      isQueryMatch(parseQuery('user.adorable=false'), log, compiledGetters)
    ).toBeFalsy();
  });
});
