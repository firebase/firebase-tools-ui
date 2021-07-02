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

import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import InspectionBlock from './InspectionBlock';

describe('InspectionSection/InspectionBlock', () => {
  it('renders normal inspection block when isMainBlock is falsy', () => {
    const { getByText, getByTestId } = render(
      <InspectionBlock
        label="Regular block"
        isMainBlock={false}
        value={{ nullValue: null }}
      />
    );
    expect(getByText('Regular block')).not.toBeNull();
    expect(getByTestId('inspection-block')).not.toBeNull();
  });

  it('renders main inspection block when isMainBlock is true', () => {
    const { getByText, getByTestId } = render(
      <InspectionBlock
        label="Main block"
        isMainBlock={true}
        value={{ nullValue: null }}
      />
    );
    expect(getByText('Main block')).not.toBeNull();
    expect(getByTestId('inspection-main-block')).not.toBeNull();
  });

  it("toggle block's expanded-icon-indicator when icon is clicked", async () => {
    const { getByText, findByText } = render(
      <InspectionBlock
        label="Regular block"
        isMainBlock={false}
        value={{ nullValue: null }}
      />
    );
    act(() => {
      fireEvent.click(getByText('expand_more'));
    });
    expect(await findByText('expand_less')).not.toBeNull();
  });

  it("show block's value after expanding block", async () => {
    const { getByText, findByText } = render(
      <InspectionBlock
        label="Regular block"
        value={{ stringValue: 'Inspection mocked value' }}
        isMainBlock={false}
      />
    );
    act(() => {
      fireEvent.click(getByText('expand_more'));
    });
    expect(await findByText('"Inspection mocked value"')).not.toBeNull();
  });

  it("show block's html children after expanding block", async () => {
    const { getByText, findByText } = render(
      <InspectionBlock
        label="Regular block"
        value={{ stringValue: 'Inspection mocked value' }}
        isMainBlock={false}
      >
        <div> Inspection mocked HTML children </div>
      </InspectionBlock>
    );
    act(() => {
      fireEvent.click(getByText('expand_more'));
    });
    expect(await findByText('Inspection mocked HTML children')).not.toBeNull();
  });
});
