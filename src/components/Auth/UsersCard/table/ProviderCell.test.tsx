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

import { createFakeUser } from '../../test_utils';
import { ProviderCell } from './ProviderCell';

describe('ProviderCell', () => {
  const phoneNumber = '+689';
  const email = '6@8.9';

  it('renders only phoneNumber icon', () => {
    const user = createFakeUser({
      phoneNumber,
      providerUserInfo: [{ providerId: 'phone' }],
    });
    const { queryByLabelText, getByLabelText } = render(
      <ProviderCell user={user} />
    );
    expect(getByLabelText('phone')).not.toBeNull();
    expect(queryByLabelText('password')).toBeNull();
  });

  it('renders only email icon', () => {
    const user = createFakeUser({
      email,
      providerUserInfo: [{ providerId: 'password' }],
    });

    const { queryByLabelText } = render(<ProviderCell user={user} />);
    expect(queryByLabelText('phone')).toBeNull();
    expect(queryByLabelText('password')).not.toBeNull();
  });

  it('renders both icons', () => {
    const user = createFakeUser({
      phoneNumber,
      email,
      providerUserInfo: [{ providerId: 'password' }, { providerId: 'phone' }],
    });
    const { queryByLabelText } = render(<ProviderCell user={user} />);
    expect(queryByLabelText('phone')).not.toBeNull();
    expect(queryByLabelText('password')).not.toBeNull();
  });

  it('supports other providers', () => {
    const user = createFakeUser({
      phoneNumber,
      email,
      providerUserInfo: [
        { providerId: 'twitter.com' },
        { providerId: 'microsoft.com' },
      ],
    });
    const { queryByLabelText } = render(<ProviderCell user={user} />);
    expect(queryByLabelText('twitter.com')).not.toBeNull();
    expect(queryByLabelText('microsoft.com')).not.toBeNull();
  });

  it('ignores unsupported providers', () => {
    const user = createFakeUser({
      phoneNumber,
      email,
      providerUserInfo: [{ providerId: 'foo.example.com' as any }],
    });
    const { queryByLabelText } = render(<ProviderCell user={user} />);
    expect(queryByLabelText('foo.example.com')).toBeNull();
  });
});
