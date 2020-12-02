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

import { act, fireEvent, render, waitForElement } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Route, Router } from 'react-router-dom';

import {
  CollectionListItem,
  RootCollectionList,
  SubCollectionList,
} from './CollectionList';
import { renderWithFirestore } from './testing/FirestoreTestProviders';

it('shows the root-collection list', async () => {
  const { getByText } = await renderWithFirestore(async firestore => {
    await firestore.doc('coll-1/thing').set({ a: 1 });
    await firestore.doc('coll-2/thing').set({ a: 1 });
    return <RootCollectionList />;
  });

  await waitForElement(() => getByText(/coll-1/));

  expect(getByText(/coll-1/)).not.toBeNull();
  expect(getByText(/coll-2/)).not.toBeNull();
});

it('shows the sub-collection list', async () => {
  const { getByText } = await renderWithFirestore(async firestore => {
    const docRef = firestore.doc('top/thing');
    await docRef
      .collection('coll-1')
      .doc('other')
      .set({ a: 1 });
    await docRef
      .collection('coll-2')
      .doc('other')
      .set({ a: 1 });
    return <SubCollectionList reference={docRef} />;
  });

  await waitForElement(() => getByText(/coll-1/));

  expect(getByText(/coll-1/)).not.toBeNull();
  expect(getByText(/coll-2/)).not.toBeNull();
});

it('redirects to collection when clicking the collection list item', async () => {
  const history = createMemoryHistory({ initialEntries: ['/firestore'] });
  const { getByTestId } = await render(
    <Router history={history}>
      <Route path="/firestore">
        <CollectionListItem
          collectionId="sub-coll-1"
          routeMatchUrl="/coll-1/thing"
        />
      </Route>
    </Router>
  );

  fireEvent.click(getByTestId('firestore-collection-list-item'));
  expect(history.location.pathname).toBe('/coll-1/thing/sub-coll-1');
});

it('redirects to collection when clicking the collection list item and the ids have special characters', async () => {
  const history = createMemoryHistory({ initialEntries: ['/firestore'] });
  const { getByTestId } = await render(
    <Router history={history}>
      <Route path="/firestore">
        <CollectionListItem
          collectionId="sub-coll-1@#$"
          routeMatchUrl="/coll-1%40%23%24/thing%40%23%24"
        />
      </Route>
    </Router>
  );

  fireEvent.click(getByTestId('firestore-collection-list-item'));
  expect(history.location.pathname).toBe(
    '/coll-1%40%23%24/thing%40%23%24/sub-coll-1%40%23%24'
  );
});

it('triggers a redirect to a new collection at the root', async () => {
  const { getByLabelText, getByText } = await renderWithFirestore(
    async firestore => {
      await firestore.doc('coll-1/thing').set({ a: 1 });
      return (
        <>
          <Route path="/firestore/coll-1">
            <RootCollectionList />
          </Route>

          <Route path="/firestore/abc">_redirected_to_foo_</Route>
        </>
      );
    },
    {
      path: '/firestore/coll-1',
    }
  );

  await waitForElement(() => getByText(/coll-1/));

  act(() => getByText(/Start collection/).click());

  await act(async () => {
    fireEvent.change(getByLabelText(/Collection ID/), {
      target: { value: 'abc' },
    });
  });

  act(() => getByText(/Next/).click());

  await act(async () => {
    fireEvent.change(getByLabelText(/Field/), {
      target: { value: 'foo' },
    });
  });

  await act(async () => {
    getByText(/Save/).click();
  });

  await waitForElement(() => getByText(/_redirected_to_foo/));

  expect(getByText(/_redirected_to_foo/)).not.toBeNull();
});

it('triggers a redirect to a new collection at the root when there are special characters on the ids', async () => {
  const { getByLabelText, getByText } = await renderWithFirestore(
    async firestore => {
      await firestore.doc('coll-1@#$/thing@#$').set({ a: 1 });
      return (
        <>
          <Route path="/firestore/coll-1%40%23%24">
            <RootCollectionList />
          </Route>

          <Route path="/firestore/abc%40%23%24">_redirected_to_foo_</Route>
        </>
      );
    },
    {
      path: '/firestore/coll-1%40%23%24',
    }
  );

  await waitForElement(() => getByText(/coll-1/));

  act(() => getByText(/Start collection/).click());

  await act(async () => {
    fireEvent.change(getByLabelText(/Collection ID/), {
      target: { value: 'abc@#$' },
    });
  });

  act(() => getByText(/Next/).click());

  await act(async () => {
    fireEvent.change(getByLabelText(/Field/), {
      target: { value: 'foo' },
    });
  });

  await act(async () => {
    getByText(/Save/).click();
  });

  await waitForElement(() => getByText(/_redirected_to_foo/));

  expect(getByText(/_redirected_to_foo/)).not.toBeNull();
});

it('triggers a redirect to a new collection in a document', async () => {
  const { getByLabelText, getByText } = await renderWithFirestore(
    async firestore => {
      const docRef = firestore.doc('top/thing');
      await docRef
        .collection('coll-1')
        .doc('other')
        .set({ a: 1 });
      return (
        <>
          <Route path="/firestore/top/thing">
            <SubCollectionList reference={docRef} />
          </Route>

          <Route path="/firestore/top/thing/abc">
            _redirected_to_sub_document_
          </Route>
        </>
      );
    },
    {
      path: '/firestore/top/thing',
    }
  );

  await waitForElement(() => getByText(/coll-1/));

  act(() => getByText(/Start collection/).click());

  await act(async () => {
    fireEvent.change(getByLabelText(/Collection ID/), {
      target: { value: 'abc' },
    });
  });

  act(() => getByText(/Next/).click());

  await act(async () => {
    fireEvent.change(getByLabelText(/Field/), {
      target: { value: 'foo' },
    });
  });

  await act(async () => {
    getByText(/Save/).click();
  });

  await waitForElement(() => getByText(/_redirected_to_sub_document_/));

  expect(getByText(/_redirected_to_sub_document_/)).not.toBeNull();
});

it('triggers a redirect to a new collection in a document when there are special characters on the ids', async () => {
  const { getByLabelText, getByText } = await renderWithFirestore(
    async firestore => {
      const docRef = firestore.doc('top@#$/thing@#$');
      await docRef
        .collection('coll-1@#$')
        .doc('other@#$')
        .set({ a: 1 });
      return (
        <>
          <Route path="/firestore/top%40%23%24/thing%40%23%24">
            <SubCollectionList reference={docRef} />
          </Route>

          <Route path="/firestore/top%40%23%24/thing%40%23%24/abc%40%23%24">
            _redirected_to_sub_document_
          </Route>
        </>
      );
    },
    {
      path: '/firestore/top%40%23%24/thing%40%23%24',
    }
  );

  await waitForElement(() => getByText(/coll-1/));

  act(() => getByText(/Start collection/).click());

  await act(async () => {
    fireEvent.change(getByLabelText(/Collection ID/), {
      target: { value: 'abc@#$' },
    });
  });

  act(() => getByText(/Next/).click());

  await act(async () => {
    fireEvent.change(getByLabelText(/Field/), {
      target: { value: 'foo' },
    });
  });

  await act(async () => {
    getByText(/Save/).click();
  });

  await waitForElement(() => getByText(/_redirected_to_sub_document_/));

  expect(getByText(/_redirected_to_sub_document_/)).not.toBeNull();
});
