import { Portal } from '@rmwc/base';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { waitForDialogsToOpen } from '../../../test_utils';
import { AddUserDialog } from './AddUserDialog';

// Those components require store and add extra validations.
jest.mock('./controls/EmailPassword');
jest.mock('./controls/PhoneControl');

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
    const { triggerValidation, onClose } = await setup();
    await waitForDialogsToOpen();

    expect(onClose).not.toHaveBeenCalled();
    await triggerValidation();
    expect(onClose).toHaveBeenCalled();
  });

  it('calls createUser on form submit', async () => {
    const { triggerValidation, createUser } = await setup();

    expect(createUser).not.toHaveBeenCalled();
    await triggerValidation();
    expect(createUser).toHaveBeenCalled();
  });
});
