import { Portal } from '@rmwc/base';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { waitForDialogsToOpen } from '../../../test_utils';
import { AuthUser } from '../types';
import { EditUserDialog } from './EditUserDialog';

describe('EditUserDialog', () => {
  const displayName = 'pirojok';
  const localId = 'pelmeni';
  const disabled = false;
  const createdAt = new Date().toLocaleDateString();
  const lastLoginAt = new Date();

  async function setup(user?: AuthUser) {
    user =
      user ||
      ({
        displayName,
        localId,
        disabled,
        createdAt,
        lastLoginAt,
      } as AuthUser);
    const onClose = jest.fn();
    const updateUser = jest.fn();
    const methods = render(
      <>
        <Portal />
        <EditUserDialog onClose={onClose} user={user} updateUser={updateUser} />
      </>
    );

    await waitForDialogsToOpen();

    const triggerValidation = async () => {
      await act(async () => {
        fireEvent.submit(methods.getByTestId('user-form'));
      });
    };

    return {
      triggerValidation,
      onClose,
      updateUser,
      ...methods,
    };
  }

  it('calls onClose on form submit', async () => {
    const { triggerValidation, onClose, getByLabelText } = await setup();

    const input = getByLabelText(/Phone authentication/) as HTMLInputElement;

    fireEvent.change(input, {
      target: { value: '+1 689-689-6896' },
    });
    fireEvent.blur(input);

    expect(onClose).not.toHaveBeenCalled();
    await triggerValidation();
    expect(onClose).toHaveBeenCalled();
  });

  it('calls updateUser on form submit', async () => {
    const { triggerValidation, updateUser, getByLabelText } = await setup();

    const input = getByLabelText(/Phone authentication/) as HTMLInputElement;

    fireEvent.change(input, {
      target: { value: '+1 689-689-6896' },
    });
    fireEvent.blur(input);

    expect(updateUser).not.toHaveBeenCalled();
    await triggerValidation();
    expect(updateUser).toHaveBeenCalled();
  });
});
