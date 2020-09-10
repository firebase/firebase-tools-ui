import { fireEvent, render } from '@testing-library/react';
import React from 'react';

import { ClearAll } from './ClearAll';

describe('ClearAll', () => {
  it('calls clearAllData callback on button click', () => {
    const clearAllData = jest.fn();

    const { getByText } = render(
      <ClearAll hasUsers={true} clearAllData={clearAllData} />
    );

    const button = getByText('Clear all data');
    fireEvent.click(button);
    expect(clearAllData).toHaveBeenCalled();
  });

  it('hides the button of there are no users', () => {
    const clearAllData = jest.fn();

    const { queryByText } = render(
      <ClearAll hasUsers={false} clearAllData={clearAllData} />
    );

    expect(queryByText('Clear all data')).toBeNull();
  });
});
