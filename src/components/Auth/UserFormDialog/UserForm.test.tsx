/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Portal } from '@rmwc/base';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { createRemoteDataLoaded } from '../../../store/utils';
import { createFakeUser, getMockAuthStore } from '../test_utils';
import { AuthUser } from '../types';
import { UserForm, UserFormProps } from './UserForm';

describe('UserForm', () => {
  const displayName = 'pirojok';
  const phoneNumber = '+1 555-555-0100';

  function setup(testProps: Partial<UserFormProps>) {
    const store = getMockAuthStore();
    const updateUser = jest.fn();
    const createUser = jest.fn();
    const clearAuthUserDialogData = jest.fn();
    const props = {
      authUserDialogData: undefined,
      user: undefined,
      updateUser,
      createUser: createUser,
      clearAuthUserDialogData: jest.fn(),
      ...testProps,
    };
    const methods = render(
      <Provider store={store}>
        <Portal />
        <UserForm {...props} />
      </Provider>
    );

    const triggerValidation = async () => {
      await act(async () => {
        fireEvent.submit(methods.getByTestId('user-form'));
      });
    };

    return {
      updateUser,
      createUser,
      clearAuthUserDialogData,
      triggerValidation,
      ...methods,
    };
  }

  it('calls onUpdate on form submit if user is provided', async () => {
    const user = createFakeUser({
      displayName,
      phoneNumber,
    });

    const { triggerValidation, getByText, updateUser, queryByText } = setup({
      authUserDialogData: createRemoteDataLoaded(user),
      user: user,
    });

    // Appropriate title is set
    getByText('Edit User ' + displayName);
    expect(queryByText('Save and create another')).toBeNull();

    expect(updateUser).not.toHaveBeenCalled();

    await triggerValidation();
    expect(updateUser).toHaveBeenCalledWith({
      localId: user.localId,
      user: expect.objectContaining({
        displayName,
        phoneNumber,
      }),
    });
  });

  it('calls onCreate on form submit if user is not provided', async () => {
    const { triggerValidation, getByText, getByLabelText, createUser } = setup(
      {}
    );

    expect(createUser).not.toHaveBeenCalled();

    getByText('Add a user');

    const input = getByLabelText(/Phone/) as HTMLInputElement;

    await act(async () => {
      await fireEvent.change(input, {
        target: { value: phoneNumber },
      });
      await fireEvent.blur(input);
    });

    await triggerValidation();

    expect(createUser).toHaveBeenCalledWith({
      keepDialogOpen: undefined,
      user: expect.objectContaining({ phoneNumber: '+1 555-555-0100' }),
    });
  });

  it('calls onCreate, but does not close the form when "create and new" clicked', async () => {
    const { triggerValidation, getByLabelText, getByText, createUser } = setup(
      {}
    );

    expect(createUser).not.toHaveBeenCalled();

    const input = getByLabelText(/Phone/) as HTMLInputElement;

    await act(async () => {
      await fireEvent.change(input, {
        target: { value: phoneNumber },
      });
      await fireEvent.blur(input);
    });

    await triggerValidation();

    await act(async () => {
      await fireEvent.click(getByText('Save and create another'));
    });

    expect(createUser).toHaveBeenCalledWith({
      keepDialogOpen: true,
      user: expect.objectContaining({ phoneNumber: '+1 555-555-0100' }),
    });
  });

  it('does not call onSave on form submit if there are errors', async () => {
    const { triggerValidation, updateUser } = setup({
      authUserDialogData: createRemoteDataLoaded({
        phoneNumber: '',
      } as AuthUser),
    });

    await triggerValidation();

    expect(updateUser).not.toHaveBeenCalled();
  });
});
