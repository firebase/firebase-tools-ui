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

import '../index.scss';

import CodeMirror from '@uiw/react-codemirror';
import React, { useEffect, useState } from 'react';

import { LineOutcome } from '../types';

const RulesCodeViewer: React.FC<{
  linesOutcome?: LineOutcome[];
  firestoreRules: string;
}> = ({ linesOutcome, firestoreRules }) => {
  const [codeMirrorEditor, setCodeMirrorEditor] = useState<any>(null);

  // highlights and adds outcome icon to corresponding lines of rules code viewer
  function highlightLineOutcomes() {
    linesOutcome?.map(lineAction => {
      const { line, outcome } = lineAction;
      // add gutter
      const icons = {
        allow: `check`, // check icon
        deny: `close`, // close icon
        error: `error`, // error icon
      };
      // TODO: Replace jQuery to a virtualDOM strategy if possible
      // https://github.com/scniro/react-codemirror2/issues/57
      let marker = document.createElement('i');
      marker.className = `${outcome} material-icons`;
      marker.innerText = icons[outcome];
      codeMirrorEditor.setGutterMarker(
        line - 1,
        'CodeMirror-gutter-elt',
        marker
      );
      codeMirrorEditor.addLineClass(line - 1, '', outcome);
    });
  }

  useEffect(() => {
    if (codeMirrorEditor) {
      highlightLineOutcomes();
    }
  }, [codeMirrorEditor]);

  return (
    <div className="Firestore-Evaluation-Details-Code">
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

export default RulesCodeViewer;
