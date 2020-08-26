import { fireEvent, render } from '@testing-library/react';
import React from 'react';

import { AuthHeader } from './AuthHeader';

jest.mock('./AuthFilter');

describe('AuthHeader text', () => {
  it('triggers onOpenNewUserDialog on button click', () => {
    const onOpenNewUserDialog = jest.fn();

    const { getByText } = render(
      <AuthHeader onOpenNewUserDialog={onOpenNewUserDialog} />
    );

    fireEvent.click(getByText('Add user'));
    expect(onOpenNewUserDialog).toHaveBeenCalled();
  });
});
