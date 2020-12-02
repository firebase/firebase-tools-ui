/**
 * Copyright 2019 Google LLC
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
import { waitForElement } from '@testing-library/react';
import React from 'react';
import { Route } from 'react-router-dom';

import { Document, Root } from './Document';
import { renderWithFirestore } from './testing/FirestoreTestProviders';

it('shows the root-id', async () => {
  const { getByText } = await renderWithFirestore(async () => <Root />);

  await waitForElement(() => getByText(/Root/));

  expect(getByText(/Root/)).not.toBeNull();
});

it('shows the document-id', async () => {
  const { getByText } = await renderWithFirestore(async firestore => {
    const docRef = firestore.doc('my-stuff/foo');
    await docRef.set({ a: 1 });
    return (
      <>
        <Document reference={firestore.doc('my-stuff/foo')} />
        <Portal />
      </>
    );
  });

  await waitForElement(() => getByText(/foo/));

  expect(getByText(/foo/)).not.toBeNull();
});

it('shows the root collection-list', async () => {
  const { getByText, getByTestId } = await renderWithFirestore(
    async firestore => {
      await firestore.doc('foo/bar').set({ a: 1 });
      return (
        <>
          <Root />
          <Portal />
        </>
      );
    }
  );

  await waitForElement(() => getByTestId('collection-list'));

  expect(getByTestId('collection-list')).not.toBeNull();
  expect(getByText('foo')).not.toBeNull();
});

it('shows the document collection-list', async () => {
  const { getByText, getByTestId } = await renderWithFirestore(
    async firestore => {
      const documentRef = firestore.doc('foo/bar');
      await documentRef
        .collection('sub')
        .doc('spam')
        .set({ a: 1 });
      return (
        <>
          <Document reference={documentRef} />
          <Portal />
        </>
      );
    }
  );

  await waitForElement(() => getByTestId('collection-list'));

  expect(getByTestId('collection-list')).not.toBeNull();
  expect(getByText('sub')).not.toBeNull();
});

it('shows the selected root-collection', async () => {
  const { getAllByText, getAllByTestId } = await renderWithFirestore(
    async firestore => {
      await firestore.doc('foo/bar').set({ a: 1 });
      return (
        <Route path="/firestore">
          <Root />
          <Portal />
        </Route>
      );
    },
    {
      path: '/firestore/foo',
    }
  );

  await waitForElement(() => getAllByTestId('collection-list').length > 0);
  await waitForElement(() => getAllByText('bar').length > 0);

  expect(getAllByTestId('collection-list').length).toBeGreaterThan(0);
  expect(getAllByText('bar').length).toBeGreaterThan(0);
});

it('shows the selected root-collection when the collection id has special characters', async () => {
  const { getAllByText, getAllByTestId } = await renderWithFirestore(
    async firestore => {
      await firestore.doc('foo@#$/bar').set({ a: 1 });
      return (
        <Route path="/firestore">
          <Root />
          <Portal />
        </Route>
      );
    },
    {
      path: '/firestore/foo%40%23%24',
    }
  );

  await waitForElement(() => getAllByTestId('collection-list').length > 0);
  await waitForElement(() => getAllByText('bar').length > 0);

  expect(getAllByTestId('collection-list').length).toBeGreaterThan(0);
  expect(getAllByText('bar').length).toBeGreaterThan(0);
});

it('shows the selected document-collection', async () => {
  const { getAllByTestId, getByText } = await renderWithFirestore(
    async firestore => {
      const documentRef = firestore.doc('foo/bar');
      await documentRef
        .collection('sub')
        .doc('doc')
        .set({ spam: 'eggs' });
      return (
        <Route path="/firestore/foo/bar">
          <Document reference={documentRef} />
          <Portal />
        </Route>
      );
    },
    {
      path: '/firestore/foo/bar/sub/doc',
    }
  );

  await waitForElement(() => getAllByTestId('collection-list').length > 1);

  expect(getAllByTestId('collection-list').length).toBe(2);
  expect(getByText(/eggs/)).not.toBeNull();
});

it('shows the selected document-collection when there are collection and document ids with special characters', async () => {
  const { getAllByTestId, getByText } = await renderWithFirestore(
    async firestore => {
      const documentRef = firestore.doc('foo@#$/bar@#$');
      await documentRef
        .collection('sub@#$')
        .doc('doc@#$')
        .set({ spam: 'eggs' });
      return (
        <Route path="/firestore/foo%40%23%24/bar%40%23%24">
          <Document reference={documentRef} />
          <Portal />
        </Route>
      );
    },
    {
      path: '/firestore/foo%40%23%24/bar%40%23%24/sub%40%23%24/doc%40%23%24',
    }
  );

  await waitForElement(() => getAllByTestId('collection-list').length > 1);

  expect(getAllByTestId('collection-list').length).toBe(2);
  expect(getByText(/eggs/)).not.toBeNull();
});
