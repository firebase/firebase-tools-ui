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

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const MAX_CACHE_SIZE = 1000;

const IDENTIFIER_START = /^[\p{ID_Start}$_]$/u;
const IDENTIFIER_PART = /^[\p{ID_Continue}$\u200c\u200d]$/u;
const ASCII_DIGIT = /^[0-9]$/;
const HEX_DIGITS = /^[0-9a-fA-F]+$/;

function readIdentifier(
  path: string,
  start: number
): { value: string; nextIndex: number } | null {
  if (start >= path.length) {
    return null;
  }
  const firstCp = path.codePointAt(start);
  if (firstCp === undefined) {
    return null;
  }
  const firstChar = String.fromCodePoint(firstCp);
  if (!IDENTIFIER_START.test(firstChar)) {
    return null;
  }

  let i = start + firstChar.length;
  while (i < path.length) {
    const cp = path.codePointAt(i);
    if (cp === undefined) {
      break;
    }
    const ch = String.fromCodePoint(cp);
    if (!IDENTIFIER_PART.test(ch)) {
      break;
    }
    i += ch.length;
  }

  return { value: path.slice(start, i), nextIndex: i };
}

function readQuotedString(
  path: string,
  start: number
): { value: string; nextIndex: number } | null {
  const quote = path[start];
  let i = start + 1;
  let value = '';

  while (i < path.length) {
    const ch = path[i++];
    if (ch === quote) {
      return { value, nextIndex: i };
    }
    if (ch === '\n' || ch === '\r') {
      return null;
    }
    if (ch === '\\') {
      if (i >= path.length) {
        return null;
      }
      const esc = path[i++];
      switch (esc) {
        case '\\':
          value += '\\';
          break;
        case "'":
          value += "'";
          break;
        case '"':
          value += '"';
          break;
        case 'n':
          value += '\n';
          break;
        case 'r':
          value += '\r';
          break;
        case 't':
          value += '\t';
          break;
        case 'b':
          value += '\b';
          break;
        case 'f':
          value += '\f';
          break;
        case 'v':
          value += '\v';
          break;
        case '0':
          if (i < path.length && ASCII_DIGIT.test(path[i])) {
            return null;
          }
          value += '\0';
          break;
        case 'x': {
          const hex = path.slice(i, i + 2);
          if (hex.length !== 2 || !HEX_DIGITS.test(hex)) {
            return null;
          }
          value += String.fromCharCode(parseInt(hex, 16));
          i += 2;
          break;
        }
        case 'u': {
          if (path[i] === '{') {
            const closeIdx = path.indexOf('}', i + 1);
            if (closeIdx === -1 || closeIdx === i + 1) {
              return null;
            }
            const hex = path.slice(i + 1, closeIdx);
            if (!HEX_DIGITS.test(hex)) {
              return null;
            }
            const cp = parseInt(hex, 16);
            if (cp > 0x10ffff) {
              return null;
            }
            value += String.fromCodePoint(cp);
            i = closeIdx + 1;
          } else {
            const hex = path.slice(i, i + 4);
            if (hex.length !== 4 || !HEX_DIGITS.test(hex)) {
              return null;
            }
            value += String.fromCharCode(parseInt(hex, 16));
            i += 4;
          }
          break;
        }
        case '\r':
          if (path[i] === '\n') {
            i++;
          }
          break;
        case '\n':
          break;
        default:
          value += esc;
          break;
      }
    } else {
      value += ch;
    }
  }

  return null;
}

function readBracketKey(
  path: string,
  start: number
): { value: string; nextIndex: number } | null {
  let i = start + 1;
  while (i < path.length && (path[i] === ' ' || path[i] === '\t')) {
    i++;
  }
  if (i >= path.length) {
    return null;
  }

  let key: string;
  if (path[i] === "'" || path[i] === '"') {
    const str = readQuotedString(path, i);
    if (!str) {
      return null;
    }
    key = str.value;
    i = str.nextIndex;
  } else if (ASCII_DIGIT.test(path[i])) {
    const numStart = i;
    while (i < path.length && ASCII_DIGIT.test(path[i])) {
      i++;
    }
    key = path.slice(numStart, i);
    if (key.length > 1 && key[0] === '0') {
      return null;
    }
  } else {
    return null;
  }

  while (i < path.length && (path[i] === ' ' || path[i] === '\t')) {
    i++;
  }
  if (i >= path.length || path[i] !== ']') {
    return null;
  }

  return { value: key, nextIndex: i + 1 };
}

function parsePath(path: string): string[] | null {
  if (!path) {
    return null;
  }

  const first = readIdentifier(path, 0);
  if (!first || BLOCKED_KEYS.has(first.value)) {
    return null;
  }

  const segments: string[] = [first.value];
  let i = first.nextIndex;

  while (i < path.length) {
    const ch = path[i];
    if (ch === '.') {
      const ident = readIdentifier(path, i + 1);
      if (!ident || BLOCKED_KEYS.has(ident.value)) {
        return null;
      }
      segments.push(ident.value);
      i = ident.nextIndex;
    } else if (ch === '[') {
      const bracket = readBracketKey(path, i);
      if (!bracket || BLOCKED_KEYS.has(bracket.value)) {
        return null;
      }
      segments.push(bracket.value);
      i = bracket.nextIndex;
    } else {
      return null;
    }
  }

  return segments;
}

function compileGetter(path: string): ((obj: any) => any) | null {
  const segments = parsePath(path);
  if (!segments) {
    return null;
  }

  return (obj: any) => {
    let current = obj;
    for (const key of segments) {
      if (
        current === null ||
        current === undefined ||
        (typeof current !== 'object' && typeof current !== 'string')
      ) {
        return undefined;
      }
      if (!Object.prototype.hasOwnProperty.call(current, key)) {
        return undefined;
      }
      current = current[key];
    }
    return current;
  };
}

export class CompiledGetterCache {
  private readonly getters = new Map<string, ((obj: any) => any) | null>();

  getOrCompile(path: string, obj: any): any {
    let getter = this.getters.get(path);
    if (getter === undefined) {
      getter = compileGetter(path);
      if (this.getters.size >= MAX_CACHE_SIZE) {
        const oldestKey = this.getters.keys().next().value;
        if (oldestKey !== undefined) {
          this.getters.delete(oldestKey);
        }
      }
      this.getters.set(path, getter);
    }

    if (!getter) {
      return undefined;
    }

    try {
      return getter(obj);
    } catch (err) {
      return undefined;
    }
  }
}
