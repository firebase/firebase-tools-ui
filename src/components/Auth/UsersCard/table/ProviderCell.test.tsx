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
