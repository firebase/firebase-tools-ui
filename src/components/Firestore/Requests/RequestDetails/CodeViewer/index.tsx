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

import 'codemirror/keymap/sublime';
import 'codemirror/theme/xq-light.css';

import './index.scss';

import { ThemeProvider } from '@rmwc/theme';
import CodeMirror from '@uiw/react-codemirror';
import React, { useCallback, useEffect, useState } from 'react';

import { errorTheme, successTheme } from '../../../../../themes';
import { OutcomeInfo, RulesOutcome } from '../../rules_evaluation_result_model';
import { ICON_SELECTOR } from '../../utils';
import CodeViewerAdminRequest from './AdminRequest';

interface Props {
  firestoreRules?: string;
  linesOutcome?: OutcomeInfo[];
  isAdminRequest: boolean;
}

const RulesCodeViewer: React.FC<Props> = ({
  firestoreRules,
  linesOutcome,
  isAdminRequest,
}) => {
  const [
    codeMirrorEditor,
    setCodeMirrorEditor,
  ] = useState<CodeMirror.Editor | null>(null);

  // Creates HTMLElement of a Marker containing the outcome icon
  const getMarkerElement = useCallback((outcome: RulesOutcome): HTMLElement => {
    let marker = document.createElement('i');
    marker.className = `CodeMirror-gutter-icon ${outcome} material-icons`;
    marker.innerText = ICON_SELECTOR[outcome];
    return marker;
  }, []);

  // Adds the corresponding Marker with the correct outcome icon
  // to all lines that have an outcome (allow or deny)
  const addLinesOutcomeGutters = useCallback(() => {
    linesOutcome?.map(({ line, outcome }) => {
      codeMirrorEditor?.setGutterMarker(
        line - 1,
        'CodeMirror-gutter-elt',
        getMarkerElement(outcome)
      );
      codeMirrorEditor?.addLineClass(
        line - 1,
        '',
        `highlighted-line-of-code--${outcome}`
      );
    });
  }, [codeMirrorEditor, linesOutcome, getMarkerElement]);

  // Highlights and adds the outcome Gutter to corresponding lines of rules code viewer
  // NOTE: a Gutter in CodeMirror is an icon displayed next to the line number
  useEffect(() => {
    if (codeMirrorEditor) {
      addLinesOutcomeGutters();
    }
  }, [codeMirrorEditor, addLinesOutcomeGutters]);

  const renderCodeViewer = () => {
    if (isAdminRequest) {
      return <CodeViewerAdminRequest />;
    }
    return (
      <CodeMirror
        value={firestoreRules}
        options={{
          theme: 'xq-light',
          keyMap: 'sublime',
          mode: 'jsx',
          tabSize: 2,
          readOnly: true,
          gutters: ['CodeMirror-gutter-elt'],
        }}
        onChanges={(editor) => !codeMirrorEditor && setCodeMirrorEditor(editor)}
      />
    );
  };

  return (
    <ThemeProvider
      options={{
        successThemePrimary: successTheme.primary,
        successThemeBackground: successTheme.background,
        errorThemePrimary: errorTheme.primary,
        errorThemeBackground: errorTheme.background,
      }}
    >
      <div
        data-testid="request-details-code-viewer-section"
        className="Firestore-Request-Details-Code-Section"
      >
        {renderCodeViewer()}
      </div>
    </ThemeProvider>
  );
};

export default RulesCodeViewer;
