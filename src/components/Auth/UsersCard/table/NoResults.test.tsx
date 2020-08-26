import { render } from '@testing-library/react';
import React from 'react';

import { NoResults } from './NoResults';

describe('NoResults', () => {
  it('renders header row when there are no users', () => {
    const { getByText } = render(<NoResults />);
    expect(getByText('No results')).not.toBeNull();
  });
});
