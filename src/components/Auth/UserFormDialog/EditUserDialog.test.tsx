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
  const createdAt = new Date();

  async function setup(user?: AuthUser) {
    user = user || {
      displayName,
      localId,
      disabled,
      createdAt,
    };
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
    const { triggerValidation, onClose } = await setup();

    expect(onClose).not.toHaveBeenCalled();
    await triggerValidation();
    expect(onClose).toHaveBeenCalled();
  });

  it('calls addUser on form submit', async () => {
    const { triggerValidation, updateUser } = await setup();

    expect(updateUser).not.toHaveBeenCalled();
    await triggerValidation();
    expect(updateUser).toHaveBeenCalled();
  });
});
