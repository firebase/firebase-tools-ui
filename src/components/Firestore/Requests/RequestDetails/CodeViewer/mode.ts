/**
 * Copyright 2021 Google LLC
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
// Based on http://go/codemirror-firebase-rules

import 'codemirror/addon/mode/simple';

import CodeMirror from 'codemirror';

const FIREBASE_RULES_KEYWORD_REGEX = /(?:allow|function|match|service|if|import|as|let|return)\b/;
const FIREBASE_RULES_VARIABLE_REGEX = /[a-z$][\w$]*/;

const FIREBASE_RULES_ATOM_REGEX = /true|false|null/;
const FIREBASE_RULES_COMMENT_REGEX = /(\/\/.*)/;
const FIREBASE_RULES_OPERATOR_REGEX = /(?:[-+/*=<>!&|]+)/;
const FIREBASE_RULES_NUMBER_REGEX = /(b?"[^"]*")|(b?'[^']*')|[0-9]+(\.[0-9]+)?/;
// Creating tokens for these helps code mirror find text marks by mouse position
const FIREBASE_RULES_MISC_REGEX = /(?:[.,:[\]{}()])/;
const FIREBASE_RULES_STRING_REGEX = /(?:auth|create|delete|get|headers|method|params|path|read|request|resource|time|uid|update|write|list)\b/;

export const MODE_FIREBASE_RULES = 'firebaseRules';

export function defineFirebaseRulesMode() {
  CodeMirror.defineSimpleMode(MODE_FIREBASE_RULES, {
    start: [
      { regex: FIREBASE_RULES_COMMENT_REGEX, token: 'comment' },
      { regex: /\/\*/, token: 'comment', next: 'comment' },
      { regex: FIREBASE_RULES_KEYWORD_REGEX, token: 'keyword' },
      { regex: FIREBASE_RULES_ATOM_REGEX, token: 'atom' },
      { regex: FIREBASE_RULES_OPERATOR_REGEX, token: 'operator' },
      { regex: FIREBASE_RULES_STRING_REGEX, token: 'string' },
      { regex: FIREBASE_RULES_NUMBER_REGEX, token: 'number' },
      { regex: FIREBASE_RULES_VARIABLE_REGEX, token: 'variable' },
      { regex: FIREBASE_RULES_MISC_REGEX, token: 'misc' },
    ],
    comment: [
      { regex: /.*?\*\//, token: 'comment', next: 'start' },
      { regex: /.*/, token: 'comment' },
    ],
    meta: { dontIndentStates: ['comment'], lineComment: '//' },
  });
}
