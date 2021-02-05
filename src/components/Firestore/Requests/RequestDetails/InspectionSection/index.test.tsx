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
import InspectionSection, { EXPRESSIONS_INSPECTION_LABEL } from './index';

describe('InspectionSection', () => {
  const INSPECTION_MOCKED_DATA: InspectionElement[] = [
    { label: 'TEST_1', value: 'MOCKED_VALUE_1' },
    { label: 'TEST_2', value: 'MOCKED_VALUE_2' },
    { label: 'TEST_3', value: 'MOCKED_VALUE_3' },
  ];

  it("renders expressions inspection's main block", () => {
    const { getByText } = render(<InspectionSection />);
    expect(getByText(EXPRESSIONS_INSPECTION_LABEL)).not.toBeNull();
  });

  it('renders all given inspectionExpressions as inspection-blocks', () => {
    const { getAllByTestId, getByText } = render(
      <InspectionSection inspectionExpressions={INSPECTION_MOCKED_DATA} />
    );
    expect(getAllByTestId('inspection-block').length).toBe(
      INSPECTION_MOCKED_DATA.length
    );
    INSPECTION_MOCKED_DATA.forEach(({ label }) => {
      expect(getByText(label)).not.toBeNull();
    });
  });
});
