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

import React, { useState, useEffect } from 'react';
import { TextField } from '@rmwc/textfield';

const NumberEditor: React.FC<{
  value: number;
  onChange: (value: number) => void;
}> = ({ value, onChange }) => {
  const [state, setState] = useState<string | number>(value);

  useEffect(() => {
    setState(value);
  }, [value, setState]);

  function handleChange(value: string) {
    const newValue = parseInt(value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    } else {
      setState(value);
    }
  }

  return (
    <TextField
      label="Value"
      outlined
      type="number"
      value={state}
      onChange={e => handleChange(e.currentTarget.value)}
    />
  );
};

export default NumberEditor;
