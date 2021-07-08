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

import './index.scss';

import React from 'react';

import { InspectionElement } from '../../types';
import InspectionBlock from './InspectionBlock';

export const EXPRESSIONS_INSPECTION_LABEL = 'Detailed information';
export const NOTHING_TO_SHOW_MESSAGE = 'Nothing to show here';

interface Props {
  inspectionExpressions?: InspectionElement[];
}

const InspectionSection: React.FC<Props> = ({ inspectionExpressions }) => {
  const renderInspectionContent = () => {
    if (!inspectionExpressions?.length) {
      return (
        <span className="Firestore-Request-Details-Inspection-Nothing-To-Show">
          {NOTHING_TO_SHOW_MESSAGE}
        </span>
      );
    }
    return inspectionExpressions.map(({ label, value }) => (
      <InspectionBlock key={label} label={label} value={value} />
    ));
  };

  return (
    <div
      data-testid="request-details-inspection-section"
      className="Firestore-Request-Details-Inspection"
    >
      <InspectionBlock
        isMainBlock
        label={EXPRESSIONS_INSPECTION_LABEL}
        value={{ nullValue: null }}
      >
        {renderInspectionContent()}
      </InspectionBlock>
    </div>
  );
};

export default InspectionSection;
