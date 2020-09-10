import { render } from '@testing-library/react';
import React from 'react';

import { AuthUser } from '../../types';
import { ProviderCell } from './ProviderCell';

describe('ProviderCell', () => {
  const phone = '689';
  const email = '6@8.9';

  it('renders only phone icon', () => {
    const user = { phone } as AuthUser;
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
    const user = { phone, email } as AuthUser;
    const { queryByLabelText } = render(<ProviderCell user={user} />);
    expect(queryByLabelText('Phone')).not.toBeNull();
    expect(queryByLabelText('Email')).not.toBeNull();
  });
});
