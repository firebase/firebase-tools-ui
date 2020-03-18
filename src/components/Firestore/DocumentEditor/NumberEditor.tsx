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

import { TextField } from '@rmwc/textfield';
import React, { useEffect, useState } from 'react';

const NumberEditor: React.FC<{
  value: number;
  onChange: (value: number) => void;
}> = ({ value, onChange }) => {
  const [number, setNumber] = useState(String(value));

  useEffect(() => {
    const num = parseFloat(number);
    if (!isNaN(num)) {
      onChange(num);
    }
  }, [number, onChange]);

  return (
    <TextField
      label="Value"
      outlined
      type="number"
      value={number}
      onChange={e => setNumber(e.currentTarget.value)}
    />
  );
};

export default NumberEditor;
