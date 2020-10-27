import { fireEvent, render } from '@testing-library/react';
import React from 'react';

import { RefreshButton } from './RefreshButton';

describe('RefreshButton text', () => {
  it('calls the refresh prop', () => {
    const refresh = jest.fn();

    const { getByLabelText } = render(<RefreshButton refresh={refresh} />);

    expect(refresh).not.toHaveBeenCalled();
    fireEvent.click(getByLabelText('Refresh'));
    expect(refresh).toHaveBeenCalled();
  });
});
