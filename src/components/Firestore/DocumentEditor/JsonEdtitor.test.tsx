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

import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { FormContext, useForm } from 'react-hook-form';

import { ApiProvider } from '../ApiContext';
import { fakeDocumentReference } from '../testing/models';
import JsonEditor from './JsonEditor';

const GOOD_PATH = '/wow/cool';

const API = {
  database: {
    doc: path => {
      if (path !== GOOD_PATH) {
        throw '';
      }

      return fakeDocumentReference({ path });
    },
  },
};

const TestForm: React.FC = ({ children }) => {
  const methods = useForm();
  return (
    <FormContext {...methods}>
      <ApiProvider value={API}>{children}</ApiProvider>
    </FormContext>
  );
};

it('renders an editor for a document-ref', async () => {
  const onChange = jest.fn();
  const { getByLabelText, getByText } = render(
    <TestForm>
      <JsonEditor
        name="foo"
        value={fakeDocumentReference({
          path: '/foo/bar',
        })}
        onChange={onChange}
      />
    </TestForm>
  );

  expect(getByLabelText(/Document path/).value).toBe('/foo/bar');

  await act(async () => {
    fireEvent.change(getByLabelText(/Document path/), {
      target: { value: 'foo' },
    });
  });

  expect(onChange).not.toHaveBeenCalled();
  expect(getByText(/Must point to a document/)).not.toBeNull();

  await act(async () => {
    fireEvent.change(getByLabelText(/Document path/), {
      target: { value: GOOD_PATH },
    });
  });

  expect(onChange.mock.calls[0][0].path).toBe(GOOD_PATH);
});
