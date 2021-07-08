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

import { OutcomeInfo } from '../../rules_evaluation_result_model';
import { ICON_SELECTOR } from '../../utils';
import { ADMIN_REQUEST_MESSAGE } from './AdminRequest';
import CodeViewer from '.';

describe('CodeViewer', () => {
  const TEST_RULES = 'TEST_RULES';

  it('renders rules-bypassed message when the request is admin', () => {
    const { getByText } = render(
      <CodeViewer
        firestoreRules={undefined}
        linesOutcome={[]}
        isAdminRequest={true}
      />
    );
    expect(getByText(ADMIN_REQUEST_MESSAGE)).not.toBeNull();
  });

  it('renders code-viewer when the request is not admin', async () => {
    const { findAllByText } = render(
      <CodeViewer
        firestoreRules={TEST_RULES}
        linesOutcome={[]}
        isAdminRequest={false}
      />
    );
    expect(await findAllByText(TEST_RULES)).not.toHaveLength(0);
  });

  // NOTE: a gutter-icon is the small icon placed right next to the codemirror line of code number
  // TODO: Investigate why gutter icon tests are failing.
  it.skip('renders the correct gutter-icon when the request was allowed', async () => {
    const MOCKED_ALLOW_LINE: OutcomeInfo = { outcome: 'allow', line: 1 };
    const { findByText } = render(
      <CodeViewer
        firestoreRules={TEST_RULES}
        linesOutcome={[MOCKED_ALLOW_LINE]}
        isAdminRequest={false}
      />
    );
    // NOTE: asynchonous findByText is needed because gutter-icon
    // is added only after the code-mirror component loads
    expect(await findByText(ICON_SELECTOR['allow'])).not.toBeNull();
  });

  // TODO: Investigate why gutter icon tests are failing.
  it.skip('renders the correct gutter-icon when the request was denied', async () => {
    const MOCKED_DENIED_LINE: OutcomeInfo = { outcome: 'deny', line: 1 };
    const { findByText } = render(
      <CodeViewer
        firestoreRules={TEST_RULES}
        linesOutcome={[MOCKED_DENIED_LINE]}
        isAdminRequest={false}
      />
    );
    // NOTE: asynchonous findByText is needed because gutter-icon
    // is added only after the code-mirror component loads
    expect(await findByText(ICON_SELECTOR['deny'])).not.toBeNull();
  });

  // TODO: Investigate why gutter icon tests are failing.
  it.skip('renders the correct gutter-icon when the request failed', async () => {
    const MOCKED_ERROR_LINE: OutcomeInfo = { outcome: 'error', line: 1 };
    const { findByText } = render(
      <CodeViewer
        firestoreRules={TEST_RULES}
        linesOutcome={[MOCKED_ERROR_LINE]}
        isAdminRequest={false}
      />
    );
    // NOTE: asynchonous findByText is needed because gutter-icon
    // is added only after the code-mirror component loads
    expect(await findByText(ICON_SELECTOR['error'])).not.toBeNull();
  });

  // TODO: Test that the lines of code are correctly highlighted when request is:
  //    -allow
  //    -deny
  //    -error
  // There is currently no good way of testing css (the highlighting is done by adding
  // a class to the <div> that contains the corresponding line of code)
});
