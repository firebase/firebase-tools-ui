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

import './InspectionSection.scss';

import React from 'react';

import { InspectionElement } from '../types';
import InspectionBlock from './InspectionBlock';

interface Props {
  inspectionExpressions?: InspectionElement[];
  inspectionQueryData?: InspectionElement[];
}

const InspectionSection: React.FC<Props> = ({
  inspectionExpressions,
  inspectionQueryData,
}) => (
  <div
    data-testid="request-details-inspection-section"
    className="Firestore-Request-Details-Inspection"
  >
    <InspectionBlock isMainBlock label="Query Information">
      {inspectionQueryData?.map(({ label, value }, index) => (
        <InspectionBlock key={index} label={label} value={value} />
      ))}
    </InspectionBlock>
    <InspectionBlock isMainBlock label="Expressions Inspection">
      <InspectionBlock label="isSignedIn()" value="false" />
      {inspectionExpressions?.map(({ label, value }, index) => (
        <InspectionBlock key={index} label={label} value={value} />
      ))}
    </InspectionBlock>
  </div>
);

export default InspectionSection;
