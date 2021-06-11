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

import './InspectionBlock.scss';

import { Icon } from '@rmwc/icon';
import { Theme, ThemeProvider } from '@rmwc/theme';
import classnames from 'classnames';
import firebase from 'firebase';
import React, { useState } from 'react';

import { grey100, textBlackTertiary } from '../../../../../colors';
import DocumentEditor from '../../../DocumentEditor';
import {
  FirestoreAny,
  FirestoreArray,
  FirestoreMap,
  FirestorePrimitive,
} from '../../../models';
import { RulesValue } from '../../rules_evaluation_result_model';

const INSPECT_BLOCK_CLASS = 'Firestore-Request-Details-Inspection-Block';
const MAIN_INSPECT_BLOCK_CLASS = INSPECT_BLOCK_CLASS + '--Main';

const MAIN_INSPECT_BLOCK_BACKGROUND_COLOR = '#e2e2e2';

interface Props {
  label: string;
  value: FirestoreAny;
  isMainBlock?: boolean;
}

export const InspectionBlock: React.FC<Props> = ({
  label,
  value,
  isMainBlock,
  children,
}) => {
  // Main inspection-blocks start expanded by default
  const [isExpanded, setIsExpanded] = useState<boolean>(!!isMainBlock);

  // NOTE: the content of the InspectionBlock could be either a string
  // (passed through the value property) or HTML children elements.
  const renderContent = () => {
    if (children) {
      return children;
    }
    // TODO: improve how the value property is rendered: differ by value types
    //       (string, number, boolean, object and maybe array too)
    return (
      <Theme use="secondary">
        <div className={`${INSPECT_BLOCK_CLASS}-Value`} title="placeholder">
          <DocumentEditor value={value}></DocumentEditor>
        </div>
      </Theme>
    );
  };

  return (
    <ThemeProvider
      options={{
        surface: isMainBlock ? MAIN_INSPECT_BLOCK_BACKGROUND_COLOR : grey100,
        textIconOnLight: textBlackTertiary,
      }}
    >
      <Theme use="surface" wrap>
        <div
          className={classnames(
            INSPECT_BLOCK_CLASS,
            isMainBlock && MAIN_INSPECT_BLOCK_CLASS
          )}
          onClick={() => setIsExpanded(!isExpanded)}
          data-testid={
            isMainBlock ? 'inspection-main-block' : 'inspection-block'
          }
        >
          <span className={`${INSPECT_BLOCK_CLASS}-Label`}>{label}</span>
          <Theme use="textIconOnLight">
            <Icon
              className={`${INSPECT_BLOCK_CLASS}-Icon`}
              icon={{ icon: isExpanded ? 'expand_less' : 'expand_more' }}
            />
          </Theme>
        </div>
      </Theme>
      {isExpanded && renderContent()}
    </ThemeProvider>
  );
};

export default InspectionBlock;
