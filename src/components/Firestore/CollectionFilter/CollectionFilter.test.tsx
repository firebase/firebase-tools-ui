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

import { CollectionFilter as CollectionFilterType } from '../models';
import { FirestoreStore, useCollectionFilter } from '../store';
import { CollectionFilter } from './CollectionFilter';

function setup({
  collectionFilter = {} as CollectionFilterType,
  path = '/foo/bar',
  children = null as React.ReactNode,
  onClose = () => {},
} = {}) {
  const collectionFilters = {
    [path]: collectionFilter,
  };
  return render(
    <FirestoreStore initState={{ collectionFilters }}>
      <CollectionFilter path={path} onClose={onClose} />
      {children}
    </FirestoreStore>
  );
}

it('loads any found collection-filter', () => {
  const { getByLabelText } = setup({
    collectionFilter: {
      field: '__field__',
      operator: '>',
      value: '__value__',
      sort: 'asc',
    },
    path: '/foo/bar',
  });

  expect(getByLabelText(/Enter field/).value).toBe('__field__');
  expect(getByLabelText(/Only show/).value).toBe('>');
  expect(getByLabelText(/Value/).value).toBe('__value__');
  expect(getByLabelText(/Ascending/).checked).toBe(true);

  expect(getByLabelText(/Code preview/).textContent).toMatch(
    /collection\("bar"\)/
  );
  expect(getByLabelText(/Code preview/).textContent).toMatch(
    /where\("__field__", ">", "__value__"\)/
  );
  expect(getByLabelText(/Code preview/).textContent).toMatch(
    /orderBy\("__field__", "asc"\)/
  );
});

it('unsets sorting when switching to an operator that does not support it', async () => {
  const { getByLabelText } = setup({
    collectionFilter: {
      field: '__field__',
      operator: '>',
      value: '__value__',
      sort: 'asc',
    },
  });

  expect(getByLabelText(/Ascending/).checked).toBe(true);

  await act(async () => {
    fireEvent.change(getByLabelText(/Only show/), {
      target: { value: '==' },
    });
  });

  expect(getByLabelText(/Ascending/).disabled).toBe(true);
  expect(getByLabelText(/Code preview/).textContent).not.toMatch(/orderBy/);
});

it('supports multi-value operators', async () => {
  const { getAllByLabelText, getByText, getByLabelText } = setup({
    collectionFilter: {
      field: '__field__',
      operator: 'in',
      values: ['alpha'],
    },
  });

  expect(getByLabelText(/Code preview/).textContent).toMatch(
    /where\("__field__", "in", \["alpha"\]\)/
  );

  await act(async () => {
    getByText(/Add value/).click();
  });

  await act(async () => {
    const allValueFields = getAllByLabelText(/Value/);
    fireEvent.change(allValueFields[1], {
      target: { value: 'bravo' },
    });
  });

  expect(getByLabelText(/Code preview/).textContent).toMatch(
    /where\("__field__", "in", \["alpha","bravo"\]\)/
  );

  await act(async () => {
    getAllByLabelText(/Remove filter/)[0].click();
  });

  expect(getByLabelText(/Code preview/).textContent).toMatch(
    /where\("__field__", "in", \["bravo"\]\)/
  );
});

const StorePreview: React.FC<{ path: string }> = ({ path }) => {
  const collectionFilter = useCollectionFilter(path);

  return (
    <div data-testid="store-preview">{JSON.stringify(collectionFilter)}</div>
  );
};

it('requires a field-name', async () => {
  const onCloseSpy = jest.fn();

  const { getByTestId, getByLabelText, getByText } = setup({
    path: '/foo/bar',
    collectionFilter: {
      field: '__field__',
      operator: '>',
      value: '__value__',
      sort: 'asc',
    },
    children: <StorePreview path="/foo/bar" />,
    onClose: onCloseSpy,
  });

  await act(async () => {
    fireEvent.change(getByLabelText(/Enter field/), {
      target: { value: '' },
    });
  });

  await act(async () => {
    fireEvent.submit(getByText(/Apply/));
  });

  expect(getByTestId('store-preview').textContent).toContain(
    '"field":"__field__"'
  );
  expect(onCloseSpy).not.toHaveBeenCalled();
});

it('dispatches the collection-filter to the store', async () => {
  const onCloseSpy = jest.fn();

  const { getByTestId, getByLabelText, getByText } = setup({
    path: '/foo/bar',
    children: <StorePreview path="/foo/bar" />,
    onClose: onCloseSpy,
  });

  await act(async () => {
    fireEvent.change(getByLabelText(/Enter field/), {
      target: { value: 'alpha' },
    });
  });

  await act(async () => {
    fireEvent.submit(getByText(/Apply/));
  });

  expect(getByTestId('store-preview').textContent).toBe('{"field":"alpha"}');
  expect(onCloseSpy).toHaveBeenCalled();

  onCloseSpy.mockReset();
  await act(async () => {
    fireEvent.click(getByText(/Clear/));
  });

  expect(getByTestId('store-preview').textContent).toBe('');
  expect(onCloseSpy).toHaveBeenCalledTimes(1);
});
