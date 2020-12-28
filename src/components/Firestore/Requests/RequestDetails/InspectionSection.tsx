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

import './InspectionSection.scss';

import React from 'react';

import { InspectionElement } from '../types';
import InspectionBlock from './InspectionBlock';

const InspectionSection: React.FC<{
  inspectionElements?: InspectionElement[];
}> = ({ inspectionElements }) => (
  <div className="Firestore-Request-Details-Inspection">
    <InspectionBlock isMainBlock label="Query Information">
      <InspectionBlock label="limit" value="20" />
      <InspectionBlock label="orderBy" value="total_reviews" />
      <InspectionBlock label="where">
        <>
          <div>
            <span>name</span> <span>`{'=='}`</span> <span>'Pozole'</span>
          </div>
          <div>
            <span>avg_review_rate</span> <span>`{'>'}`</span> <span>4</span>
          </div>
        </>
      </InspectionBlock>
    </InspectionBlock>
    <InspectionBlock isMainBlock label="Expressions Inspection">
      <InspectionBlock label="isSignedIn()" value="false" />
      {inspectionElements?.map((inspectionElement, index) => {
        const { label, value } = inspectionElement;
        return <InspectionBlock key={index} label={label} value={value} />;
      })}
    </InspectionBlock>
  </div>
);

export default InspectionSection;
