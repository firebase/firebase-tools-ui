import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { getMockAuthStore } from '../test_utils';
import { AddAuthUserPayload } from '../types';
import UserForm from './UserForm';

describe('UserForm', () => {
  const displayName = 'pirojok';
  const phoneNumber = '+1 555-555-0100';

  function setup(user?: AddAuthUserPayload) {
    const onSave = jest.fn();
    const onClose = jest.fn();
    const store = getMockAuthStore();
    const methods = render(
      <Provider store={store}>
        <UserForm
          onSave={onSave}
          user={user}
          onClose={onClose}
          isEditing={false}
        />
      </Provider>
    );

    const triggerValidation = async () => {
      await act(async () => {
        fireEvent.submit(methods.getByTestId('user-form'));
      });
    };
    return {
      onSave,
      onClose,
      triggerValidation,
      ...methods,
    };
  }

  it('calls onSave on form submit', async () => {
    const { triggerValidation, onSave, onClose } = setup({
      displayName,
      phoneNumber,
    });

    expect(onSave).not.toHaveBeenCalled();

    await triggerValidation();
    expect(onClose).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalledWith(
      jasmine.objectContaining({
        displayName,
        phoneNumber,
      })
    );
  });

  it('calls onSave, but does not close the form when "create and new" clicked.', async () => {
    const phoneNumber = '+1 555-555-0100';
    const {
      getByText,
      getByLabelText,
      triggerValidation,
      onSave,
      onClose,
    } = setup({
      displayName: '',
    });

    const input = getByLabelText(/Phone/) as HTMLInputElement;

    fireEvent.change(input, {
      target: { value: phoneNumber },
    });
    fireEvent.blur(input);

    await triggerValidation();
    await act(async () => {
      await fireEvent.click(getByText('Save and create another'));
    });
    await triggerValidation();

    // Resets the form
    expect(input.value).toBe('');
    // Creates user
    expect(onSave).toHaveBeenCalledWith(
      jasmine.objectContaining({
        phoneNumber: phoneNumber,
      })
    );
  });

  it('sets input values based on passed user value', async () => {
    const email = 'lol@lol.lol';
    const password = 'qwerty';
    const { getByLabelText, queryByLabelText } = setup({
      displayName,
      email,
      password,
    });
    expect((getByLabelText(/Display name/) as HTMLInputElement).value).toBe(
      displayName
    );
    expect((queryByLabelText('Email') as HTMLInputElement).value).toBe(email);
    expect((queryByLabelText('Password') as HTMLInputElement).value).toBe(
      password
    );
  });

  it('does not call onSave on form submit if there are errors', async () => {
    const { triggerValidation, onSave, onClose } = setup({
      displayName: '',
      phoneNumber: '',
    });

    await triggerValidation();

    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
