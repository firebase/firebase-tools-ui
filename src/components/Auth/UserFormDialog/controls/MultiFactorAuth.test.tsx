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

import { act, fireEvent, prettyDOM, queryByLabelText } from '@testing-library/react';
import React from 'react';

import { wrapWithForm } from '../../../../test_utils';
import { createFakeUser } from '../../test_utils';
import { AuthFormUser } from '../../types';
import { convertToFormUser } from '../UserForm';
import { MFA_VERIFIED_EMAIL_REQUIRED_ERROR, MultiFactor, MultiFactorProps } from './MultiFactorAuth';
import { PhoneControl, PhoneControlProps } from './PhoneControl';

describe('MultiFactorAuth', () => {
  function setup(formUser: AuthFormUser, props?: Partial<MultiFactorProps>) {
    return wrapWithForm(
      MultiFactor,
      { defaultValues: formUser,mode: 'onChange',},
      props
    );
  }

  it('shows an error if email is not verified', async () => {
    const user = createFakeUser({});

    const { getByRole, queryByLabelText, queryByText, triggerValidation, findByLabelText} = setup((convertToFormUser(user) as AuthFormUser), {user});

    // make sure we start with MFA disabled
    expect(queryByLabelText('Disabled')).not.toBeNull();
    expect(queryByLabelText('Enabled')).toBeNull();

    // click to enable
    const mfaSwitch = getByRole('switch');
    console.log(prettyDOM(mfaSwitch));
    mfaSwitch.click();
    await triggerValidation();
    await findByLabelText('Enabled', undefined, {timeout: 1_000});

    // make sure switch shows MFA enabled
    expect(queryByLabelText('Disabled')).toBeNull();
    expect(queryByLabelText('Enabled')).not.toBeNull();

    // ensure the error is shown
    expect(queryByText(MFA_VERIFIED_EMAIL_REQUIRED_ERROR)).not.toBeNull();
  });
});
