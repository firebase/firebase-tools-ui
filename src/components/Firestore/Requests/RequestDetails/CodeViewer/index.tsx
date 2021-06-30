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
import 'codemirror/lib/codemirror.css';

import './index.scss';

import CodeMirror from 'codemirror';
import React, { useEffect, useRef } from 'react';

import { textBlackTertiary } from '../../../../../colors';
import { errorTheme, successTheme } from '../../../../../themes';
import { Callout } from '../../../../common/Callout';
import { OutcomeInfo, RulesOutcome } from '../../rules_evaluation_result_model';
import { ICON_SELECTOR } from '../../utils';
import CodeViewerAdminRequest from './AdminRequest';
import { MODE_FIREBASE_RULES, defineFirebaseRulesMode } from './mode';

// TODO: find a way to remove the CSSProperties cast
// (TypeScript complains if object is not casted)
const CODE_VIEWER_CUSTOM_STYLES = {
  '--emulator-ui-code-success-primary': successTheme.primary,
  '--emulator-ui-code-success-background': successTheme.background,
  '--emulator-ui-code-error-primary': errorTheme.primary,
  '--emulator-ui-code-error-background': errorTheme.background,
  '--emulator-ui-code-comment-text': textBlackTertiary,
} as React.CSSProperties;

const CODE_MIRROR_OPTIONS: CodeMirror.EditorConfiguration = {
  tabSize: 2,
  indentUnit: 2,
  lineNumbers: true,
  theme: 'devsite-light',
  keyMap: 'sublime',
  mode: MODE_FIREBASE_RULES,
  readOnly: 'nocursor',
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
  useEffect(defineFirebaseRulesMode, []);

  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      if (ref.current.style.display === 'none') {
        // CodeMirror has already initialized and replaced this textarea.
        return;
      }
      // CodeMirror objects don't need to be destroyed manually and will be
      // collected by GC once the DOM node is removed.
      const cm = CodeMirror.fromTextArea(ref.current, CODE_MIRROR_OPTIONS);
      cm.setSize('100%', '100%');
      // Highlights and adds the proper outcome-gutter to the corresponding lines of
      // the rules code-viewer.
      // NOTE: a gutter in CodeMirror is an icon displayed next to the line number
      // NOTE: this current version of the code won't remove old gutters, nor old highlighted-lines
      // if the (linesOutcome) array were to change, however, this code is fine because the
      // (codeMirrorEditor) instance is destroyed / created after the component unmounts / mounts
      // (therefore reseting all gutters and highlighted-lines). Additionally, there is currently
      // no way to update the linesOutcome array of an existing request.
      linesOutcome?.forEach(({ line, outcome }) => {
        const rulesOutcome: RulesOutcome = outcome ? 'allow' : 'deny';
        cm.setGutterMarker(
          line - 1,
          'CodeMirror-gutter-elt',
          getMarkerElement(rulesOutcome)
        );
        cm.addLineClass(
          line - 1,
          '',
          `highlighted-line-of-code--${rulesOutcome}`
        );
      });
    }
  }, [ref, firestoreRules, linesOutcome]);

  function renderCodeViewer() {
    if (isAdminRequest) {
      return <CodeViewerAdminRequest />;
    }
    return <textarea ref={ref} value={firestoreRules} readOnly></textarea>;
  }

  function renderCallout() {
    if (!linesOutcome?.length) {
      return (
        <Callout type="caution">
          The request did not match any allow statements, so it was denied by
          default.
        </Callout>
      );
    } else {
      return <></>;
    }
  }

  return (
    <div
      data-testid="request-details-code-viewer-section"
      className="Firestore-Request-Details-Code-Section"
      style={CODE_VIEWER_CUSTOM_STYLES}
    >
      {renderCallout()}
      {renderCodeViewer()}
    </div>
  );
};

export default RulesCodeViewer;
