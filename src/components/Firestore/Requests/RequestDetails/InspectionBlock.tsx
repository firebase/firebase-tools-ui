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

import './InspectionBlock.scss';

import { Icon } from '@rmwc/icon';
import { Tooltip } from '@rmwc/tooltip';
import classnames from 'classnames';
import React, { useState } from 'react';

const INSPECT_BLOCK_CLASS = 'Firestore-Request-Details-Inspection-Block';
const MAIN_INSPECT_BLOCK_CLASS = INSPECT_BLOCK_CLASS + '--Main';

export const InspectionBlock: React.FC<{
  label: string;
  value?: string;
  isMainBlock?: boolean;
}> = ({ label, value, isMainBlock, children }) => {
  const [isExpanded, setIsExpanded] = useState<Boolean>(!!isMainBlock);

  function displayContent() {
    return children ? (
      children
    ) : (
      <div className={`${INSPECT_BLOCK_CLASS}-Value`} title={value}>
        {value}
      </div>
    );
  }

  return (
    <>
      <div
        className={classnames(
          INSPECT_BLOCK_CLASS,
          isMainBlock && MAIN_INSPECT_BLOCK_CLASS
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className={`${INSPECT_BLOCK_CLASS}-Label`}> {label} </span>
        <Icon icon={{ icon: `expand_${isExpanded ? 'less' : 'more'}` }} />
      </div>
      {isExpanded && displayContent()}
    </>
  );
};

export default InspectionBlock;
