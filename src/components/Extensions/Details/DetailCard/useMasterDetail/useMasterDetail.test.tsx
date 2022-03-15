/**
 * Copyright 2022 Google LLC
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

import { getByLabelText, render } from '@testing-library/react';
import React from 'react';

import { useMasterDetail } from './useMasterDetail';

const TAB1_CONTENT = 'pirojok-the-content';
const TAB1_LABEL = 'pirojok-the-label';
const TAB2_CONTENT = 'buterbrod-the-content';
const TAB2_LABEL = 'buterbrod-the-label';
const masterDetailConfig = {
  tabs: [
    {
      label: TAB1_LABEL,
      tab: <div>{TAB1_CONTENT}</div>,
    },
    {
      label: TAB2_LABEL,
      tab: <div>{TAB2_CONTENT}</div>,
    },
  ],
};

describe('useMasterDetail', () => {
  function setup() {
    const Wrapper: React.FC = () => {
      const { tabs, content } = useMasterDetail(masterDetailConfig);
      return (
        <div>
          {tabs}
          {content}
        </div>
      );
    };

    return render(<Wrapper></Wrapper>);
  }

  it('displays one tab panel at a time', () => {
    const { getByText, getByRole } = setup();
    expect(getByText(TAB1_LABEL)).not.toBeNull();
    expect(getByText(TAB2_LABEL)).not.toBeNull();

    const tabPanel = getByRole('tabpanel');
    expect(tabPanel).not.toBeNull();
    expect(tabPanel.textContent).toContain(TAB1_CONTENT);

    expect(getByText(TAB1_CONTENT)).not.toBeNull();
  });

  it('Allows to switch tabpanel', async () => {
    const { getByText, getByRole, getByLabelText } = setup();

    await getByText(TAB2_LABEL).click();

    getByLabelText(TAB2_LABEL);

    const tabPanel = getByRole('tabpanel');
    expect(tabPanel.textContent).toContain(TAB2_CONTENT);
  });

  it('Properly labels the tabs', async () => {
    const { getByText, getByRole, getByLabelText } = setup();

    expect(getByRole('tabpanel')).toBe(getByLabelText(TAB1_LABEL));
    await getByText(TAB2_LABEL).click();
    expect(getByRole('tabpanel')).toBe(getByLabelText(TAB2_LABEL));
  });
});
