import React from 'react';

import { wrapWithForm } from '../../../../test_utils';
import { CustomAttributes } from './CustomAttributes';

describe('CustomAttributes', () => {
  function setup(customAttributes: string) {
    const defaultValues = {
      customAttributes,
    };

    return wrapWithForm(CustomAttributes, { defaultValues });
  }

  it('displays no errors for an empty object', async () => {
    const { triggerValidation, queryByRole } = setup('{}');
    await triggerValidation();
    expect(queryByRole('alert')).toBe(null);
  });

  it('displays an error for invalid JSON', async () => {
    const { triggerValidation, getByRole } = setup('pirojok');
    await triggerValidation();
    expect(getByRole('alert')).not.toBe(null);
    expect(getByRole('alert').textContent).toMatch(
      /must be a valid JSON object/
    );
  });

  it('displays an error for an array', async () => {
    const { triggerValidation, getByRole } = setup('[]');
    await triggerValidation();
    expect(getByRole('alert')).not.toBe(null);
    expect(getByRole('alert').textContent).toMatch(
      /must be a valid JSON object/
    );
  });

  it('displays an error for value that is too long', async () => {
    const { triggerValidation, getByRole } = setup('pirojok'.repeat(1000));
    await triggerValidation();
    expect(getByRole('alert')).not.toBe(null);
    expect(getByRole('alert').textContent).toMatch(/must not exceed 1000/);
  });

  it('displays an error if a forbidden key was used', async () => {
    const { triggerValidation, getByRole, getByText } = setup(
      '{"firebase": "is awesome"}'
    );
    await triggerValidation();
    expect(getByRole('alert')).not.toBe(null);
    expect(getByRole('alert').textContent).toMatch(/forbidden key: firebase/);
  });
});
