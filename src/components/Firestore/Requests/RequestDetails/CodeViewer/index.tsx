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

import CodeMirror from '@uiw/react-codemirror';
import React, { useEffect, useState } from 'react';

import { textBlackTertiary } from '../../../../../colors';
import { errorTheme, successTheme } from '../../../../../themes';
import { OutcomeInfo, RulesOutcome } from '../../rules_evaluation_result_model';
import { ICON_SELECTOR } from '../../utils';
import CodeViewerAdminRequest from './AdminRequest';

// TODO: find a way to remove the CSSProperties cast
// (TypeScript complains if object is not casted)
const CODE_VIEWER_CUSTOM_STYLES = {
  '--emulator-ui-code-success-primary': successTheme.primary,
  '--emulator-ui-code-success-background': successTheme.background,
  '--emulator-ui-code-error-primary': errorTheme.primary,
  '--emulator-ui-code-error-background': errorTheme.background,
  '--emulator-ui-code-comment-text': textBlackTertiary,
} as React.CSSProperties;

const CODE_MIRROR_OPTIONS = {
  theme: 'xq-light',
  keyMap: 'sublime',
  mode: 'jsx',
  tabSize: 2,
  readOnly: true,
  gutters: ['CodeMirror-gutter-elt'],
};

// Creates HTMLElement of a Marker containing the outcome icon
function getMarkerElement(outcome: RulesOutcome): HTMLElement {
  let marker = document.createElement('i');
  marker.className = `CodeMirror-gutter-icon ${outcome} material-icons`;
  marker.textContent = ICON_SELECTOR[outcome];
  return marker;
}

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

  // Highlights and adds the proper outcome-gutter to the corresponding lines of
  // the rules code-viewer.
  // NOTE: a gutter in CodeMirror is an icon displayed next to the line number
  // NOTE: this current version of the code won't remove old gutters, nor old highlighted-lines
  // if the (linesOutcome) array were to change, however, this code is fine because the
  // (codeMirrorEditor) instance is destroyed / created after the component unmounts / mounts
  // (therefore reseting all gutters and highlighted-lines). Additionally, there is currently
  // no way to update the linesOutcome array of an existing request.
  useEffect(() => {
    if (codeMirrorEditor && linesOutcome) {
      linesOutcome.forEach(({ line, outcome }) => {
        const rulesOutcome: RulesOutcome = outcome ? 'allow' : 'deny';
        codeMirrorEditor.setGutterMarker(
          line - 1,
          'CodeMirror-gutter-elt',
          getMarkerElement(rulesOutcome)
        );
        codeMirrorEditor.addLineClass(
          line - 1,
          '',
          `highlighted-line-of-code--${rulesOutcome}`
        );
      });
    }
  }, [codeMirrorEditor, linesOutcome]);

  const renderCodeViewer = () => {
    if (isAdminRequest) {
      return <CodeViewerAdminRequest />;
    }
    return (
      <CodeMirror
        value={firestoreRules}
        options={CODE_MIRROR_OPTIONS}
        onChanges={(editor) => !codeMirrorEditor && setCodeMirrorEditor(editor)}
      />
    );
  };

  return (
    <div
      data-testid="request-details-code-viewer-section"
      className="Firestore-Request-Details-Code-Section"
      style={CODE_VIEWER_CUSTOM_STYLES}
    >
      {renderCodeViewer()}
    </div>
  );
};

export default RulesCodeViewer;
