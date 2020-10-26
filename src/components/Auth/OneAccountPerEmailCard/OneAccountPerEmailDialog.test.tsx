import { Portal } from '@rmwc/base';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { AppState } from '../../../store';
import { OneAccountPerEmailDialog } from './OneAccountPerEmailDialog';

describe('OneAccountPerEmailDialog', () => {
  function setup(allowDuplicateEmails = false) {
    const onClose = jest.fn();
    const setAllowDuplicateEmails = jest.fn();
    const store = configureStore<Pick<AppState, 'auth'>>()({
      auth: {
        users: [],
        filter: '',
        allowDuplicateEmails: false,
      },
    });

    const methods = render(
      <Provider store={store}>
        <Portal />
        <OneAccountPerEmailDialog
          allowDuplicateEmails={allowDuplicateEmails}
          onClose={onClose}
          setAllowDuplicateEmails={setAllowDuplicateEmails}
        />
      </Provider>
    );

    return {
      onClose,
      setAllowDuplicateEmails,
      ...methods,
    };
  }

  it('calls onClose on hitting "save" button', async () => {
    const { getByText, onClose } = setup();
    fireEvent.submit(getByText('Save'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls setAllowDuplicateEmails on hitting "save" button', async () => {
    const { getByText, setAllowDuplicateEmails } = setup();
    fireEvent.submit(getByText('Save'));
    expect(setAllowDuplicateEmails).toHaveBeenCalledWith(false);
  });

  it('updates value', async () => {
    const { getByText, setAllowDuplicateEmails, getByLabelText } = setup(true);

    const radio = getByLabelText(/Allow creation of multiple accounts/);

    fireEvent.click(radio);

    fireEvent.submit(getByText('Save'));
    expect(setAllowDuplicateEmails).toHaveBeenCalledWith(false);
  });

  it('calls onClose on hitting "cancel" button', async () => {
    const { getByText, onClose } = setup();
    fireEvent.click(getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
