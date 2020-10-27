import { render } from '@testing-library/react';
import React from 'react';

import { AuthZeroState } from './AuthZeroState';

describe('AuthZeroState', () => {
  it('renders header row when there are no users', () => {
    const { getByText } = render(<AuthZeroState />);
    expect(getByText(/No users/)).not.toBeNull();
  });
});
