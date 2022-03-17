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

import { render } from '@testing-library/react';
import React from 'react';

import { ParamType } from '../../../models';
import { ParamValue } from './ParamValue';

describe('ParamValue', () => {
  const PARAM_VALUE = 'pirojok-the-param';

  it('renders non secret param', () => {
    const { getByText } = render(
      <ParamValue value={PARAM_VALUE} type={ParamType.SELECT} />
    );

    expect(getByText(PARAM_VALUE)).not.toBeNull();
  });

  it('renders secret params', () => {
    const { getByText, getByLabelText } = render(
      <ParamValue value={PARAM_VALUE} type={ParamType.SECRET} />
    );

    expect(getByText('***')).not.toBeNull();
    expect(getByLabelText('Show value')).not.toBeNull();
  });

  it('shows the value', async () => {
    const { getByText, getByLabelText } = render(
      <ParamValue value={PARAM_VALUE} type={ParamType.SECRET} />
    );

    await getByLabelText('Show value').click();
    expect(getByText(PARAM_VALUE)).not.toBeNull();
  });
});
