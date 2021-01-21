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
import { ThemeProvider } from '@rmwc/theme';
import classnames from 'classnames';
import React, { useState } from 'react';

import { darkestGray } from '../../../../../colors';

const INSPECT_BLOCK_CLASS = 'Firestore-Request-Details-Inspection-Block';
const MAIN_INSPECT_BLOCK_CLASS = INSPECT_BLOCK_CLASS + '--Main';

interface Props {
  label: string;
  value?: string;
  isMainBlock?: boolean;
}

export const InspectionBlock: React.FC<Props> = ({
  label,
  value,
  isMainBlock,
  children,
}) => {
  // Main inspection-blocks start expanded by default
  const [isExpanded, setIsExpanded] = useState<Boolean>(!!isMainBlock);

  // NOTE: the content of the InspectionBlock could be either a string
  // (passed through the value property) or HTML children elements.
  const renderContent = () => {
    if (children) {
      return children;
    }
    // TODO: improve how the value property is rendered: differ by value types
    //       (string, number, boolean, object and maybe array too)
    return (
      <div className={`${INSPECT_BLOCK_CLASS}-Value`} title={value}>
        {value}
      </div>
    );
  };

  return (
    <ThemeProvider
      options={{
        inspectionMainBlockBackground: darkestGray,
      }}
    >
      <div
        className={classnames(
          INSPECT_BLOCK_CLASS,
          isMainBlock && MAIN_INSPECT_BLOCK_CLASS
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        role={isMainBlock ? 'inspection-main-block' : 'inspection-block'}
      >
        <span className={`${INSPECT_BLOCK_CLASS}-Label`}> {label} </span>
        <Icon
          className={`${INSPECT_BLOCK_CLASS}-Icon`}
          icon={{ icon: isExpanded ? 'expand_less' : 'expand_more' }}
        />
      </div>
      {isExpanded && renderContent()}
    </ThemeProvider>
  );
};

export default InspectionBlock;
