import { fireEvent, render } from '@testing-library/react';
import React from 'react';

import { ClearAll } from './ClearAll';

describe('ClearAll', () => {
  it('triggers onOpenNewUserDialog on button click', () => {
    const clearAllData = jest.fn();

    const { getByText } = render(<ClearAll clearAllData={clearAllData} />);

    const button = getByText('Clear all data');
    fireEvent.click(button);
    expect(clearAllData).toHaveBeenCalled();
  });
});
