/**
 * Copyright 2019 Google LLC
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

import 'codemirror/keymap/sublime';
import 'codemirror/theme/xq-light.css';

import './index.scss';

import { IconButton } from '@rmwc/icon-button';
import CodeMirror from '@uiw/react-codemirror';
import React, { useEffect, useState } from 'react';
import ReactDOMServer from 'react-dom/server';

import {
  FirestoreRulesIssue,
  RulesOutcome,
} from './rules_evaluation_result_model';

export interface LineOutcome {
  line: number;
  outcome: RulesOutcome;
}

export const RulesCode: React.FC<{
  linesOutcome: LineOutcome[];
  firestoreRules: string;
  rulesIssues: FirestoreRulesIssue[];
}> = ({ linesOutcome, firestoreRules, rulesIssues }) => {
  const [codeMirrorEditor, setCodeMirrorEditor] = useState<any>(null);
  const [prevLinesOutcome, setPrevLinesOutcome] = useState<LineOutcome[]>([]);

  // highlights and adds outcome icon to corresponding lines of rules code viewer
  useEffect(() => {
    if (codeMirrorEditor) {
      // if line actions were made before, undo them first
      if (prevLinesOutcome.length) {
        prevLinesOutcome.map(lineAction => {
          const { line, outcome } = lineAction;
          codeMirrorEditor.removeLineClass(line, '', outcome);
          codeMirrorEditor.clearGutter('CodeMirror-gutter-elt');
        });
      }
      // do new line actions
      linesOutcome &&
        linesOutcome.map(lineAction => {
          const { line, outcome } = lineAction;
          codeMirrorEditor.addLineClass(line, '', outcome);
          // add gutter
          const icons = {
            allow: `✅`, // check icon
            deny: `❌`, // close icon
            error: `⚠️`, // error icon
          };
          const parser = new DOMParser();
          const reactExcl = ReactDOMServer.renderToStaticMarkup(
            // <IconButton icon={icons[outcome]} label={outcome} />
            <span className={outcome}> {icons[outcome]} </span>
          );
          let excl: any = parser.parseFromString(reactExcl, 'image/svg+xml')
            .firstChild;
          codeMirrorEditor.setGutterMarker(line, 'CodeMirror-gutter-elt', excl);
        });
      setPrevLinesOutcome(linesOutcome || []);
    }
  }, [codeMirrorEditor, linesOutcome]);

  return (
    <div className="Firestore-Rules-Code">
      <div className="Firestore-Rules-Code-TopBar" />
      <CodeMirror
        value={firestoreRules}
        options={{
          theme: 'xq-light',
          keyMap: 'sublime',
          mode: 'jsx',
          tabsize: 2,
          readOnly: true,
          gutters: ['CodeMirror-gutter-elt'],
        }}
        onChanges={editor => !codeMirrorEditor && setCodeMirrorEditor(editor)}
      />
    </div>
  );
};

export default RulesCode;
