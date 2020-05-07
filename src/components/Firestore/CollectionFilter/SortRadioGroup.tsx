/**
 * Copyright 2020 Google LLC
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

import { Radio } from '@rmwc/radio';
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

export const SortRadioGroup: React.FC<{ name: string; disabled: boolean }> = ({
  name,
  disabled,
}) => {
  const { register, setValue, unregister, watch } = useFormContext();

  useEffect(() => {
    if (!disabled) {
      register({ name });
    } else {
      setValue(name, undefined);
    }

    return () => unregister(name);
  }, [register, unregister, disabled, name, setValue]);

  const sort = watch(name);

  return (
    <>
      <Radio
        value="asc"
        label="Ascending"
        checked={sort === 'asc'}
        onChange={() => setValue(name, 'asc')}
        disabled={disabled}
      />

      <Radio
        value="desc"
        label="Descending"
        checked={sort === 'desc'}
        onChange={() => setValue(name, 'desc')}
        disabled={disabled}
      />
    </>
  );
};
