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

import { ThemeProvider } from '@rmwc/theme';
import CodeMirror from '@uiw/react-codemirror';
import React, { useCallback, useEffect, useState } from 'react';

import { errorTheme, successTheme } from '../../../../themes';
import {
  FirestoreRulesIssue,
  OutcomeInfo,
  RulesOutcome,
} from '../rules_evaluation_result_model';
import { getIconFromRequestOutcome } from '../utils';
import CodeViewerZeroState from './CodeViewerZeroState';

interface Props {
  firestoreRules?: string;
  linesOutcome?: OutcomeInfo[];
  linesIssues?: FirestoreRulesIssue[];
}

const RulesCodeViewer: React.FC<Props> = ({
  firestoreRules,
  linesOutcome,
  linesIssues,
}) => {
  const [codeMirrorEditor, setCodeMirrorEditor] = useState<any>(null);

  // Creates HTMLElement of a Marker containing the outcome icon
  const getMarkerElement = useCallback((outcome: RulesOutcome): HTMLElement => {
    // TODO: Is there a better way of creating a HTMLElement without manipulating DOM?
    // JSX can't be passed to the codemirror library, see: https://github.com/scniro/react-codemirror2/issues/57
    let marker = document.createElement('i');
    marker.className = `${outcome} material-icons`;
    marker.innerText = getIconFromRequestOutcome(outcome);
    return marker;
  }, []);

  // Adds the corresponding Marker with the correct outcome icon
  // to all lines that have an outcome (allow or deny)
  const addLinesOutcomeGutters = useCallback(() => {
    linesOutcome?.map((lineAction) => {
      const { line, outcome } = lineAction;
      codeMirrorEditor.setGutterMarker(
        line - 1,
        'CodeMirror-gutter-elt',
        getMarkerElement(outcome)
      );
      codeMirrorEditor.addLineClass(line - 1, '', outcome);
    });
  }, [codeMirrorEditor, linesOutcome, getMarkerElement]);

  // Adds the corresponding Marker with the error icon
  // to all lines that have an issue (error)
  const addLinesIssuesGutters = useCallback(() => {
    linesIssues?.map((lineIssue) => {
      const { line } = lineIssue;
      codeMirrorEditor.setGutterMarker(
        line - 1,
        'CodeMirror-gutter-elt',
        getMarkerElement('error')
      );
      codeMirrorEditor.addLineClass(line - 1, '', 'error');
    });
  }, [codeMirrorEditor, linesIssues, getMarkerElement]);

  // Highlights and adds the outcome Gutter to corresponding lines of rules code viewer
  // (a Gutter in CodeMirror is an icon displayed next to the line number)
  useEffect(() => {
    if (codeMirrorEditor) {
      addLinesOutcomeGutters();
      addLinesIssuesGutters();
    }
  }, [codeMirrorEditor, addLinesOutcomeGutters, addLinesIssuesGutters]);

  return (
    <ThemeProvider
      options={{
        successThemePrimary: successTheme.primary,
        successThemeBackground: successTheme.background,
        errorThemePrimary: errorTheme.primary,
        errorThemeBackground: errorTheme.background,
      }}
    >
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
            onChanges={(editor) =>
              !codeMirrorEditor && setCodeMirrorEditor(editor)
            }
          />
        )}
        {!firestoreRules && <CodeViewerZeroState />}
      </div>
    </ThemeProvider>
  );
};

export default RulesCodeViewer;
