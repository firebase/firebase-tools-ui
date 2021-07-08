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
import { act, waitForElement } from '@testing-library/react';
import firebase from 'firebase';
import React, { useEffect, useState } from 'react';
import { Route } from 'react-router-dom';

import { delay, waitForDialogsToOpen } from '../../test_utils';
import { confirm } from '../common/DialogQueue';
import { Document, Root } from './Document';
import { renderWithFirestore } from './testing/FirestoreTestProviders';

jest.mock('../common/DialogQueue');

it('shows the root-id', async () => {
  const { getByText } = await renderWithFirestore(async () => <Root />);

  await waitForElement(() => getByText(/Root/));

  expect(getByText(/Root/)).not.toBeNull();
});

it('shows the document-id', async () => {
  const { getByText } = await renderWithFirestore(async (firestore) => {
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
    async (firestore) => {
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
    async (firestore) => {
      const documentRef = firestore.doc('foo/bar');
      await documentRef.collection('sub').doc('spam').set({ a: 1 });
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
    async (firestore) => {
      await firestore.doc('foo/bar').set({ a: 1 });
      return (
        <Route path="/firestore/data">
          <Root />
          <Portal />
        </Route>
      );
    },
    {
      path: '/firestore/data/foo',
    }
  );

  await waitForElement(() => getAllByTestId('collection-list').length > 0);
  await waitForElement(() => getAllByText('bar').length > 0);

  expect(getAllByTestId('collection-list').length).toBeGreaterThan(0);
  expect(getAllByText('bar').length).toBeGreaterThan(0);
});

it('shows the selected root-collection when the collection id has special characters', async () => {
  const { getAllByText, getAllByTestId } = await renderWithFirestore(
    async (firestore) => {
      await firestore.doc('foo@#$/bar').set({ a: 1 });
      return (
        <Route path="/firestore/data">
          <Root />
          <Portal />
        </Route>
      );
    },
    {
      path: '/firestore/data/foo%40%23%24',
    }
  );

  await waitForElement(() => getAllByTestId('collection-list').length > 0);
  await waitForElement(() => getAllByText('bar').length > 0);

  expect(getAllByTestId('collection-list').length).toBeGreaterThan(0);
  expect(getAllByText('bar').length).toBeGreaterThan(0);
});

it('shows the selected document-collection', async () => {
  const { getAllByTestId, getByText } = await renderWithFirestore(
    async (firestore) => {
      const documentRef = firestore.doc('foo/bar');
      await documentRef.collection('sub').doc('doc').set({ spam: 'eggs' });
      return (
        <Route path="/firestore/data/foo/bar">
          <Document reference={documentRef} />
          <Portal />
        </Route>
      );
    },
    {
      path: '/firestore/data/foo/bar/sub/doc',
    }
  );

  await waitForElement(() => getAllByTestId('collection-list').length > 1);

  expect(getAllByTestId('collection-list').length).toBe(2);
  expect(getByText(/eggs/)).not.toBeNull();
});

it('shows the selected document-collection when there are collection and document ids with special characters', async () => {
  const { getAllByTestId, getByText } = await renderWithFirestore(
    async (firestore) => {
      const documentRef = firestore.doc('foo@#$/bar@#$');
      await documentRef
        .collection('sub@#$')
        .doc('doc@#$')
        .set({ spam: 'eggs' });
      return (
        <Route path="/firestore/data/foo%40%23%24/bar%40%23%24">
          <Document reference={documentRef} />
          <Portal />
        </Route>
      );
    },
    {
      path:
        '/firestore/data/foo%40%23%24/bar%40%23%24/sub%40%23%24/doc%40%23%24',
    }
  );

  await waitForElement(() => getAllByTestId('collection-list').length > 1);

  expect(getAllByTestId('collection-list').length).toBe(2);
  expect(getByText(/eggs/)).not.toBeNull();
});

const TestDeleteComponent: React.FC<{
  docRef: firebase.firestore.DocumentReference;
  nestedDocRef: firebase.firestore.DocumentReference;
}> = ({ docRef, nestedDocRef }) => {
  const [nestedDocExists, setNestedDocExists] = useState(false);

  useEffect(() => {
    // Use onSnapshot to determine if nested document still exists.
    // We cannot rely on the builtin nested collection list since that is not
    // updated in real time, thus the custom logic and dummy elements below.
    const unsubscribe = nestedDocRef.onSnapshot((snap) => {
      setNestedDocExists(snap.exists);
    });
    return unsubscribe;
  }, [docRef, nestedDocRef]);

  return (
    <div>
      <Document reference={docRef} />
      <Portal />
      <div>
        {nestedDocExists
          ? 'TEST_NESTED_DOC_EXISTS'
          : 'TEST_NESTED_DOC_DOES_NOT_EXIST'}
      </div>
    </div>
  );
};

it('deletes document when requested', async () => {
  const { findByText, findByRole } = await renderWithFirestore(
    async (firestore) => {
      const docRef = firestore.doc('whose-stuff/foo');
      const nestedDocRef = docRef
        .collection('nestedCollection')
        .doc('nestedDoc');

      await docRef.set({ myField: 1 });
      await nestedDocRef.set({ myField: 2 });
      return (
        <TestDeleteComponent docRef={docRef} nestedDocRef={nestedDocRef} />
      );
    }
  );

  const menu = await findByRole('button', { name: 'Menu' });
  await act(() => {
    menu.click();
    return delay(200);
  });

  const deleteDocument = await findByRole('menuitem', {
    name: 'Delete document',
  });

  await act(() => {
    deleteDocument.click();
    return waitForDialogsToOpen();
  });

  const confirmButton = await findByRole('button', {
    name: 'Delete',
  });

  await act(() => {
    confirmButton.click();
    return delay(200);
  });

  expect(await findByText(/This document does not exist/)).not.toBeNull();

  // Nested collection is not deleted by default.
  expect(await findByText('TEST_NESTED_DOC_EXISTS')).not.toBeNull();
}, 10000);

it('deletes document and nested data when requested', async () => {
  const { findByText, findByRole, getByRole } = await renderWithFirestore(
    async (firestore) => {
      const docRef = firestore.doc('your-stuff/foo');
      const nestedDocRef = docRef
        .collection('nestedCollection')
        .doc('nestedDoc');

      await docRef.set({ myField: 1 });
      await nestedDocRef.set({ myField: 2 });
      return (
        <TestDeleteComponent docRef={docRef} nestedDocRef={nestedDocRef} />
      );
    }
  );

  const menu = await findByRole('button', { name: 'Menu' });
  await act(() => {
    menu.click();
    return delay(200);
  });

  const deleteDocument = await findByRole('menuitem', {
    name: 'Delete document',
  });

  await act(() => {
    deleteDocument.click();
    return waitForDialogsToOpen();
  });

  const recursiveCheckbox = getByRole('checkbox', {
    name: 'Also delete nested collections and documents',
  });

  await act(() => {
    recursiveCheckbox.click();
    return delay(200);
  });

  expect(await findByText(/Cloud Functions triggers/)).not.toBeNull();

  await act(() => {
    getByRole('button', {
      name: 'Delete',
    }).click();
    return delay(500);
  });

  expect(await findByText(/This document does not exist/)).not.toBeNull();
  expect(await findByText('TEST_NESTED_DOC_DOES_NOT_EXIST')).not.toBeNull();
}, 10000);

it('deletes document fields when requested', async () => {
  const { findByText, findByRole } = await renderWithFirestore(
    async (firestore) => {
      const docRef = firestore.doc('their-stuff/foo');
      const nestedDocRef = docRef
        .collection('nestedCollection')
        .doc('nestedDoc');

      await docRef.set({ myField: 1 });
      await nestedDocRef.set({ myField: 2 });
      return (
        <TestDeleteComponent docRef={docRef} nestedDocRef={nestedDocRef} />
      );
    }
  );

  const menu = await findByRole('button', { name: 'Menu' });
  await act(() => {
    menu.click();
    return delay(200);
  });

  const deleteDocument = await findByRole('menuitem', {
    name: 'Delete all fields',
  });

  confirm.mockResolvedValueOnce(true);

  await act(() => {
    deleteDocument.click();
    return delay(200);
  });

  // Document should still exist but should have no fields now.
  expect(await findByText('This document has no data')).not.toBeNull();

  // Nested collection is not affected.
  expect(await findByText('TEST_NESTED_DOC_EXISTS')).not.toBeNull();
}, 10000);
