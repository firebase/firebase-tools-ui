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

import './CodeViewer.scss';

import CodeMirror from '@uiw/react-codemirror';
import React, { useCallback, useEffect, useState } from 'react';

import {
  FirestoreRulesIssue,
  OutcomeInfo,
} from '../rules_evaluation_result_model';
import { getIconFromRequestOutcome } from '../utils';
import CodeViewerZeroState from './CodeViewerZeroState';

const RulesCodeViewer: React.FC<{
  firestoreRules?: string;
  linesOutcome?: OutcomeInfo[];
  linesIssues?: FirestoreRulesIssue[];
}> = ({ firestoreRules, linesOutcome, linesIssues }) => {
  const [codeMirrorEditor, setCodeMirrorEditor] = useState<any>(null);

  const addLinesOutcomeGutters = useCallback(() => {
    linesOutcome?.map(lineAction => {
      const { line, outcome } = lineAction;
      // TODO: Replace jQuery to a virtualDOM strategy if possible
      // https://github.com/scniro/react-codemirror2/issues/57
      let marker = document.createElement('i');
      marker.className = `${outcome} material-icons`;
      marker.innerText = getIconFromRequestOutcome(outcome);
      codeMirrorEditor.setGutterMarker(
        line - 1,
        'CodeMirror-gutter-elt',
        marker
      );
      codeMirrorEditor.addLineClass(line - 1, '', outcome);
    });
  }, [codeMirrorEditor, linesOutcome]);

  const addLinesIssuesGutters = useCallback(() => {
    linesIssues?.map(lineIssue => {
      const { line } = lineIssue;
      // TODO: Replace jQuery to a virtualDOM strategy if possible
      // https://github.com/scniro/react-codemirror2/issues/57
      let marker = document.createElement('i');
      marker.className = 'error material-icons';
      marker.innerText = getIconFromRequestOutcome('error');
      codeMirrorEditor.setGutterMarker(
        line - 1,
        'CodeMirror-gutter-elt',
        marker
      );
      codeMirrorEditor.addLineClass(line - 1, '', 'error');
    });
  }, [codeMirrorEditor, linesIssues]);

  // highlights and adds outcome icon to corresponding lines of rules code viewer
  useEffect(() => {
    if (codeMirrorEditor) {
      // a Gutter in CodeMirror is the icon displayed next to the line number
      !linesIssues?.length && addLinesOutcomeGutters();
      addLinesIssuesGutters();
    }
  }, [
    codeMirrorEditor,
    addLinesOutcomeGutters,
    addLinesIssuesGutters,
    linesIssues,
  ]);

  return (
    <div className="Firestore-Request-Details-Code">
      {firestoreRules && (
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
      )}
      {!firestoreRules && <CodeViewerZeroState />}
    </div>
  );
};

export default RulesCodeViewer;
