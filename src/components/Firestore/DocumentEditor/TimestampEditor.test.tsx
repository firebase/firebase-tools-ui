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

import { fireEvent, render } from '@testing-library/react';
import { firestore } from 'firebase';
import React from 'react';

import TimestampEditor from './TimestampEditor';

it('renders an editor for a timestamp', () => {
  const onChange = jest.fn();
  const date = new Date(2000, 0, 2, 10, 30);
  const { getByLabelText } = render(
    <TimestampEditor
      value={firestore.Timestamp.fromDate(date)}
      onChange={onChange}
    />
  );

  const [displayDate, displayTime] = getByLabelText('Value').value.split('T');
  expect(displayDate).toBe('2000-01-02');
  expect(displayTime).toBe('10:30');

  onChange.mockReset();
  fireEvent.change(getByLabelText('Value'), {
    target: { value: 'foo' },
  });
  expect(onChange).not.toHaveBeenCalled();

  fireEvent.change(getByLabelText('Value'), {
    target: { value: '2001-01-02T14:30' },
  });

  expect(onChange).toHaveBeenCalledWith(
    firestore.Timestamp.fromDate(new Date(2001, 0, 2, 14, 30))
  );
});
