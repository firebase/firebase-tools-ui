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

import { render } from '@testing-library/react';
import React from 'react';

import { InspectionElement } from '../../types';
import InspectionSection from './index';

describe('InspectionSection', () => {
  const INSPECTION_MOCKED_DATA: InspectionElement[] = [
    { label: '', value: '' },
    { label: '', value: '' },
    { label: '', value: '' },
  ];

  it("renders expressions inspection's main block", () => {
    const { getByText } = render(<InspectionSection />);
    expect(getByText('Query Information')).not.toBeNull();
  });

  it('renders as many inspection-blocks as inspectionExpressions', () => {
    const { getAllByRole } = render(
      <InspectionSection
        inspectionExpressions={INSPECTION_MOCKED_DATA}
        inspectionQueryData={[]}
      />
    );
    expect(getAllByRole('inspection-block').length).toBe(3);
  });

  it("renders query information's main block", () => {
    const { getByText } = render(<InspectionSection />);
    expect(getByText('Expressions Inspection')).not.toBeNull();
  });

  it('renders as many inspection-blocks as inspectionQueryData', () => {
    const { getAllByRole } = render(
      <InspectionSection
        inspectionExpressions={[]}
        inspectionQueryData={INSPECTION_MOCKED_DATA}
      />
    );
    expect(getAllByRole('inspection-block').length).toBe(3);
  });
});
