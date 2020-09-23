import { Portal } from '@rmwc/base';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { waitForDialogsToOpen } from '../../../test_utils';
import { AddUserDialog } from './AddUserDialog';

describe('AddUserDialog', () => {
  async function setup() {
    const onClose = jest.fn();
    const createUser = jest.fn();
    const methods = render(
      <>
        <Portal />
        <AddUserDialog onClose={onClose} createUser={createUser} />
      </>
    );

    const triggerValidation = async () => {
      await act(async () => {
        fireEvent.submit(methods.getByTestId('user-form'));
      });
    };

    await waitForDialogsToOpen();

    return {
      triggerValidation,
      onClose,
      createUser,
      ...methods,
    };
  }

  it('calls onClose on form submit', async () => {
    const { triggerValidation, onClose, getByLabelText } = await setup();
    await waitForDialogsToOpen();

    const input = getByLabelText(/Phone authentication/) as HTMLInputElement;

    fireEvent.change(input, {
      target: { value: '+1 689-689-6896' },
    });
    fireEvent.blur(input);

    expect(onClose).not.toHaveBeenCalled();
    await triggerValidation();
    expect(onClose).toHaveBeenCalled();
  });

  it('calls createUser on form submit', async () => {
    const { triggerValidation, createUser, getByLabelText } = await setup();

    const input = getByLabelText(/Phone authentication/) as HTMLInputElement;

    fireEvent.change(input, {
      target: { value: '+1 689-689-6896' },
    });
    fireEvent.blur(input);

    expect(createUser).not.toHaveBeenCalled();
    await triggerValidation();
    expect(createUser).toHaveBeenCalled();
  });
});
