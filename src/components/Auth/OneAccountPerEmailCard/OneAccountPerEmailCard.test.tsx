import { Portal } from '@rmwc/base';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { AppState } from '../../../store';
import { waitForDialogsToOpen } from '../../../test_utils';
import { getMockAuthStore } from '../test_utils';
import {
  OneAccountPerEmailCard,
  OneAccountPerEmailCardProps,
} from './OneAccountPerEmailCard';

describe('OneAccountPerEmailCard', () => {
  function setup(props: OneAccountPerEmailCardProps) {
    const store = getMockAuthStore();

    return render(
      <Provider store={store}>
        <Portal />
        <OneAccountPerEmailCard {...props} />
      </Provider>
    );
  }

  it('opens the dialog', async () => {
    const { getByText, queryByRole } = setup({ allowDuplicateEmails: true });

    expect(queryByRole('alertdialog')).toBeNull();
    fireEvent.click(getByText('Change'));
    await waitForDialogsToOpen();
    expect(queryByRole('alertdialog')).not.toBeNull();
  });

  describe('content', () => {
    it('displays appropriate text when disabled', () => {
      const { queryByText } = setup({ allowDuplicateEmails: false });
      expect(queryByText(/One account per email address/)).not.toBeNull();
      expect(queryByText(/Multiple accounts per email address/)).toBeNull();
    });

    it('displays appropriate text when enabled', () => {
      const { queryByText } = setup({ allowDuplicateEmails: true });
      expect(queryByText(/One account per email address/)).toBeNull();
      expect(queryByText(/Multiple accounts per email address/)).not.toBeNull();
    });
  });
});
