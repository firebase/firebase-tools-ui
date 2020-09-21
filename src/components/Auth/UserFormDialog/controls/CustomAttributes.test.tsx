import { fireEvent, within } from '@testing-library/react';
import React from 'react';

import { wrapWithForm } from '../../../../test_utils';
import { AddAuthUserPayload } from '../../types';
import { CustomAttributes } from './CustomAttributes';

describe('CustomAttributes', () => {
  function setup(defaultValues?: Partial<AddAuthUserPayload>) {
    defaultValues = defaultValues || {
      customAttributes: [
        { role: 'a', value: 'b' },
        { role: 'c', value: 'd' },
        { role: 'e', value: 'f' },
      ],
    };

    const methods = wrapWithForm(CustomAttributes, { defaultValues });

    const getWrapper = () => {
      return methods.queryAllByRole('group')[0]!;
    };

    const getRow = (index = 0) => {
      return within(getWrapper()).queryAllByRole('group')[index];
    };
    const countCustomAttributes = () => {
      return within(getWrapper()).queryAllByRole('group').length;
    };
    return { ...methods, countCustomAttributes, getRow };
  }

  it('contains appropriate number of elements', async () => {
    const { triggerValidation, submit, countCustomAttributes } = setup();
    expect(countCustomAttributes()).toBe(3);

    await triggerValidation();
    expect(submit).toHaveBeenCalledWith(
      {
        customAttributes: [
          { role: 'a', value: 'b' },
          { role: 'c', value: 'd' },
          { role: 'e', value: 'f' },
        ],
      },
      jasmine.any(Object)
    );
  });

  it('allows to remove an element', async () => {
    const {
      countCustomAttributes,
      triggerValidation,
      submit,
      getRow,
    } = setup();

    const removeButton = within(getRow(0)).getByLabelText(
      'Remove custom claim'
    );
    fireEvent.click(removeButton);
    expect(countCustomAttributes()).toBe(2);

    await triggerValidation();
    expect(submit).toHaveBeenCalledWith(
      {
        customAttributes: [
          { role: 'c', value: 'd' },
          { role: 'e', value: 'f' },
        ],
      },
      jasmine.any(Object)
    );
  });

  it('allows to add another element', async () => {
    const {
      getByText,
      countCustomAttributes,
      triggerValidation,
      submit,
      getRow,
    } = setup();
    const newRole = 'pirojok';
    const newValue = 'pelmeni';

    const addButton = getByText('Add another');
    fireEvent.click(addButton);
    expect(countCustomAttributes()).toBe(4);

    const newRow = getRow(3);

    fireEvent.change(within(newRow).getByPlaceholderText('Role'), {
      target: { value: newRole },
    });

    fireEvent.change(within(newRow).getByPlaceholderText('Value'), {
      target: { value: newValue },
    });

    await triggerValidation();
    expect(submit).toHaveBeenCalledWith(
      {
        customAttributes: [
          { role: 'a', value: 'b' },
          { role: 'c', value: 'd' },
          { role: 'e', value: 'f' },
          { role: newRole, value: newValue },
        ],
      },
      jasmine.any(Object)
    );
  });
});
