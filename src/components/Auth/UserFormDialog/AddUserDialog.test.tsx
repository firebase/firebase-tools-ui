import { Portal } from '@rmwc/base';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { waitForDialogsToOpen } from '../../../test_utils';
import { AddUserDialog } from './AddUserDialog';

describe('AddUserDialog', () => {
  async function setup() {
    const onClose = jest.fn();
    const addUser = jest.fn();
    const methods = render(
      <>
        <Portal />
        <AddUserDialog onClose={onClose} addUser={addUser} />
      </>
    );

    const triggerValidation = async () => {
      fireEvent.change(methods.getByLabelText('Display name'), {
        target: { value: 'display value' },
      });

      await act(async () => {
        fireEvent.submit(methods.getByTestId('user-form'));
      });
    };

    await waitForDialogsToOpen();

    return {
      triggerValidation,
      onClose,
      addUser,
      ...methods,
    };
  }

  it('calls onClose on form submit', async () => {
    const { triggerValidation, onClose } = await setup();
    await waitForDialogsToOpen();
    expect(onClose).not.toHaveBeenCalled();
    await triggerValidation();
    expect(onClose).toHaveBeenCalled();
  });

  it('calls addUser on form submit', async () => {
    const { triggerValidation, addUser } = await setup();

    expect(addUser).not.toHaveBeenCalled();
    await triggerValidation();
    expect(addUser).toHaveBeenCalled();
  });

  it('pre-populates custom claims', async () => {
    const { getByPlaceholderText } = await setup();
    getByPlaceholderText('Role');
    getByPlaceholderText('Value');
  });
});
