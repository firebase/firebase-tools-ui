import { Portal } from '@rmwc/base';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { waitForDialogsToOpen } from '../../../test_utils';
import { createFakeUser } from '../test_utils';
import { AuthUser } from '../types';
import { EditUserDialog } from './EditUserDialog';

// Those components require store and add extra validations.
jest.mock('./controls/EmailPassword');
jest.mock('./controls/PhoneControl');

describe('EditUserDialog', () => {
  const displayName = 'pirojok';
  const localId = 'pelmeni';
  const disabled = false;
  // September 28 2020
  const createdAt = '1601310006686';
  const lastLoginAt = '1601310006686';

  async function setup(user?: AuthUser) {
    user =
      user ||
      createFakeUser({
        displayName,
        localId,
        disabled,
        createdAt,
        lastLoginAt,
      });
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

  it('calls updateUser on form submit', async () => {
    const { triggerValidation, updateUser } = await setup();

    expect(updateUser).not.toHaveBeenCalled();
    await triggerValidation();
    expect(updateUser).toHaveBeenCalled();
  });
});
