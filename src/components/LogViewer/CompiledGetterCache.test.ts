/**
 * Copyright 2026 Google LLC
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

describe('CompiledGetterCache', () => {
  let cache: CompiledGetterCache;

  beforeEach(() => {
    cache = new CompiledGetterCache();
  });

  describe('valid property paths', () => {
    it('reads top-level and dot-separated properties', () => {
      const obj = {
        level: 'info',
        data: {
          metadata: {
            function: { name: 'helloWorld' },
          },
          user: {
            $special_1: 'ok',
            nested: { value: 42 },
          },
        },
      };

      expect(cache.getOrCompile('level', obj)).toBe('info');
      expect(cache.getOrCompile('data.metadata.function.name', obj)).toBe(
        'helloWorld'
      );
      expect(cache.getOrCompile('data.user.$special_1', obj)).toBe('ok');
      expect(cache.getOrCompile('data.user.nested.value', obj)).toBe(42);
    });

    it('reads single- and double-quoted bracket properties including escapes', () => {
      const obj = {
        data: {
          user: {
            '...': {
              fish: {
                asd: 1234,
                '\\asd': 5678,
              },
            },
            'foo-bar': 'dash',
            'a"b': 'double-quote',
            "a'b": 'single-quote',
            'line\nbreak': 'newline',
            '': 'empty-key',
            '\x41\u0042\u{43}': 'unicode-escapes',
          },
        },
      };

      expect(cache.getOrCompile("data.user['...'].fish['\\asd']", obj)).toBe(
        1234
      );
      expect(cache.getOrCompile("data.user['...'].fish['\\\\asd']", obj)).toBe(
        5678
      );
      expect(cache.getOrCompile('data.user["foo-bar"]', obj)).toBe('dash');
      expect(cache.getOrCompile('data.user["a\\"b"]', obj)).toBe(
        'double-quote'
      );
      expect(cache.getOrCompile("data.user['a\\'b']", obj)).toBe(
        'single-quote'
      );
      expect(cache.getOrCompile('data.user["line\\nbreak"]', obj)).toBe(
        'newline'
      );
      expect(cache.getOrCompile("data.user['']", obj)).toBe('empty-key');
      expect(cache.getOrCompile('data.user["\\x41\\u0042\\u{43}"]', obj)).toBe(
        'unicode-escapes'
      );
    });

    it('reads array indices and nested array objects', () => {
      const obj = {
        user: {
          items: [{ name: 'first' }, { name: 'second' }],
          matrix: [[10, 20]],
        },
      };

      expect(cache.getOrCompile('user.items[0].name', obj)).toBe('first');
      expect(cache.getOrCompile('user.items[1].name', obj)).toBe('second');
      expect(cache.getOrCompile('user.matrix[0][1]', obj)).toBe(20);
      expect(cache.getOrCompile('user.items[ 0 ].name', obj)).toBe('first');
    });

    it('returns undefined cleanly for missing paths or nullish targets', () => {
      expect(cache.getOrCompile('data.user.missing', { data: {} })).toBe(
        undefined
      );
      expect(cache.getOrCompile('data.user.a', null)).toBe(undefined);
      expect(cache.getOrCompile('data.user.a', undefined)).toBe(undefined);
      expect(cache.getOrCompile('data.user.a', { data: { user: null } })).toBe(
        undefined
      );
    });

    it('works on null-prototype objects and caches compiled getters', () => {
      const inner = Object.create(null);
      inner.token = 'abc';
      const obj = { user: inner };

      expect(cache.getOrCompile('user.token', obj)).toBe('abc');
      expect(cache.getOrCompile('user.token', { user: { token: 'xyz' } })).toBe(
        'xyz'
      );
    });

    it('supports Unicode identifiers and evicts oldest cache entries past the limit', () => {
      expect(
        cache.getOrCompile('data.user.café', { data: { user: { café: 7 } } })
      ).toBe(7);

      for (let i = 0; i < 1050; i++) {
        expect(
          cache.getOrCompile(`data.user.k${i}`, {
            data: { user: { [`k${i}`]: i } },
          })
        ).toBe(i);
      }
      // Re-evaluating an evicted key still works cleanly.
      expect(
        cache.getOrCompile('data.user.k0', { data: { user: { k0: 99 } } })
      ).toBe(99);
    });

    it('returns undefined when a property getter throws', () => {
      const obj = {
        get boom() {
          throw new Error('fail');
        },
      };
      expect(cache.getOrCompile('boom', obj)).toBe(undefined);
    });
  });

  describe('invalid paths and prototype properties', () => {
    it('does not evaluate expressions inside bracket notation', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const log = {
        level: 'info',
        data: { user: {} },
        message: '',
        timestamp: 0,
      };

      const result = cache.getOrCompile(
        "data.user[console.log('unexpected')]",
        log
      );

      expect(result).toBe(undefined);
      expect(logSpy).not.toHaveBeenCalled();
      logSpy.mockRestore();
    });

    it('rejects non-path expressions and malformed syntax', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const obj = { data: { user: { a: 1 } } };

      const payloads = [
        'data.user[console.log(1)]',
        "data.user['a' + console.log(1)]",
        'data.user[(function(){ console.log(1); return "a"; })()]',
        'data.user.a; console.log(1)//',
        'data.user.a, console.log(1)',
        'data.user.a || console.log(1)',
        'data.user.a && console.log(1)',
        'data.user.a()',
        // eslint-disable-next-line no-template-curly-in-string
        'data.user[`${console.log(1)}`]',
        'data.user[1+1]',
        'data.user[a]',
        '',
        '.data.user',
        'data.user.',
        'data..user',
        'data.user[]',
        'data.user[01]',
        'data.user["unterminated]',
        'data.user["bad\\"]',
        'data.user["line\nbreak"]',
        'data.user["\\xZZ"]',
        'data.user["\\u123"]',
        'data.user["\\u{110000}"]',
        'data.user["\\01"]',
        'data.user[0]extra',
        '[0]',
      ];

      for (const payload of payloads) {
        expect(cache.getOrCompile(payload, obj)).toBe(undefined);
      }
      expect(logSpy).not.toHaveBeenCalled();
      logSpy.mockRestore();
    });

    it('blocks prototype chain and Object.prototype cache collisions', () => {
      const obj = {
        data: {
          user: { a: 1 },
        },
      };

      expect(cache.getOrCompile('data.user.__proto__', obj)).toBe(undefined);
      expect(cache.getOrCompile('data.user.constructor', obj)).toBe(undefined);
      expect(cache.getOrCompile('data.user.prototype', obj)).toBe(undefined);
      expect(cache.getOrCompile("data.user['__proto__']", obj)).toBe(undefined);
      expect(cache.getOrCompile('data.user["constructor"]', obj)).toBe(
        undefined
      );
      expect(cache.getOrCompile('data.user.toString', obj)).toBe(undefined);
      expect(cache.getOrCompile('data.user.valueOf', obj)).toBe(undefined);
      expect(cache.getOrCompile('toString', obj)).toBe(undefined);
      expect(cache.getOrCompile('constructor', obj)).toBe(undefined);
      expect(cache.getOrCompile('__proto__', obj)).toBe(undefined);
    });
  });
});
