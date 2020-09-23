import { render } from '@testing-library/react';
import React from 'react';

import { AuthUser } from '../../types';
import { ProviderCell } from './ProviderCell';

describe('ProviderCell', () => {
  const phoneNumber = '+689';
  const email = '6@8.9';

  it('renders only phoneNumber icon', () => {
    const user = { phoneNumber } as AuthUser;
    const { queryByLabelText } = render(<ProviderCell user={user} />);
    expect(queryByLabelText('Phone')).not.toBeNull();
    expect(queryByLabelText('Email')).toBeNull();
  });

  it('renders only email icon', () => {
    const user = { email } as AuthUser;
    const { queryByLabelText } = render(<ProviderCell user={user} />);
    expect(queryByLabelText('Phone')).toBeNull();
    expect(queryByLabelText('Email')).not.toBeNull();
  });

  it('renders both icons', () => {
    const user = { phoneNumber, email } as AuthUser;
    const { queryByLabelText } = render(<ProviderCell user={user} />);
    expect(queryByLabelText('Phone')).not.toBeNull();
    expect(queryByLabelText('Email')).not.toBeNull();
  });
});
