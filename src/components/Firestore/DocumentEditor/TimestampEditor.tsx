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
import { firestore } from 'firebase';
import React, { useEffect, useState } from 'react';

const TimestampEditor: React.FC<{
  value: firestore.Timestamp;
  onChange: (value: firestore.Timestamp) => void;
}> = ({ value, onChange }) => {
  const [timestamp, setTimestamp] = useState(value.toDate().toISOString());

  useEffect(() => {
    const ts = Date.parse(timestamp);
    if (!isNaN(ts)) {
      onChange(firestore.Timestamp.fromDate(new Date(ts)));
    }
  }, [timestamp, onChange]);

  return (
    <>
      <TextField
        label="Value"
        outlined
        type="datetime-local"
        value={timestamp.split('.')[0]}
        onChange={e => setTimestamp(e.currentTarget.value)}
      />
    </>
  );
};

export default TimestampEditor;
