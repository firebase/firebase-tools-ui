import { Portal } from '@rmwc/base';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import configureStore from '../../../configureStore';
import { OneAccountPerEmailDialog } from './OneAccountPerEmailDialog';

describe('OneAccountPerEmailDialog', () => {
  function setup(allowDuplicateEmails = false) {
    const onClose = jest.fn();
    const setAllowDuplicateEmails = jest.fn();
    const store = configureStore();
    const methods = render(
      <>
        <Provider store={store}>
          <Portal />
          <OneAccountPerEmailDialog
            allowDuplicateEmails={allowDuplicateEmails}
            onClose={onClose}
            setAllowDuplicateEmails={setAllowDuplicateEmails}
          />
        </Provider>
      </>
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

  it('calls onClose on hitting "cancel" button', async () => {
    const { getByText, onClose } = setup();
    fireEvent.click(getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
