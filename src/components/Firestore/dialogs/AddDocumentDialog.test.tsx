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

import { fireEvent } from '@testing-library/react';
import { collection } from 'firebase/firestore';
import React from 'react';
import { act } from 'react-dom/test-utils';

import { waitForDialogsToClose } from '../../../test_utils';
import { renderDialogWithFirestore } from '../testing/test_utils';
import { AddDocumentDialog } from './AddDocumentDialog';

it('shows correct title', async () => {
  const { getByText } = await renderDialogWithFirestore(async (firestore) => {
    const collectionRef = collection(firestore, 'things');
    return (
      <AddDocumentDialog
        open={true}
        collectionRef={collectionRef}
        onValue={() => {}}
      />
    );
  });

  expect(getByText(/Add a document/)).not.toBeNull();
});

it('shows the (disabled) creation path', async () => {
  const { getByLabelText } = await renderDialogWithFirestore(
    async (firestore) => {
      const nestedCollectionRef = collection(firestore, 'things/1/objects');
      return (
        <AddDocumentDialog
          open={true}
          collectionRef={nestedCollectionRef}
          onValue={() => {}}
        />
      );
    }
  );

  expect((getByLabelText('Parent path') as HTMLInputElement).value).toBe(
    'things/1/objects'
  );
  expect((getByLabelText('Parent path') as HTMLInputElement).disabled).toBe(
    true
  );
});

it('auto generates an id', async () => {
  const { getByLabelText } = await renderDialogWithFirestore(
    async (firestore) => {
      const collectionRef = collection(firestore, 'things');
      return (
        <AddDocumentDialog
          open={true}
          collectionRef={collectionRef}
          onValue={() => {}}
        />
      );
    }
  );

  expect((getByLabelText('Document ID') as HTMLInputElement).value).toMatch(
    /\w+/
  );
});

it('provides a document-editor', async () => {
  const { getByLabelText } = await renderDialogWithFirestore(
    async (firestore) => {
      const collectionRef = collection(firestore, 'things');
      return (
        <AddDocumentDialog
          open={true}
          collectionRef={collectionRef}
          onValue={() => {}}
        />
      );
    }
  );

  expect(getByLabelText('Field')).not.toBe(null);
});

it('[Save] is disabled with invalid doc-data', async () => {
  const onValue = jest.fn();
  const { getByText } = await renderDialogWithFirestore(async (firestore) => {
    const collectionRef = collection(firestore, 'things');
    return (
      <AddDocumentDialog
        open={true}
        collectionRef={collectionRef}
        onValue={onValue}
      />
    );
  });

  const saveButton = getByText('Save').closest('button');
  expect(saveButton).not.toBeNull();
  expect(saveButton!.disabled).toBe(true);
});

it('emits id and parsed data when [Save] is clicked', async () => {
  const onValue = jest.fn();
  const { getByText, getByLabelText } = await renderDialogWithFirestore(
    async (firestore) => {
      const collectionRef = collection(firestore, 'things');
      return (
        <AddDocumentDialog
          open={true}
          collectionRef={collectionRef}
          onValue={onValue}
        />
      );
    }
  );

  await act(async () => {
    fireEvent.change(getByLabelText('Document ID'), {
      target: { value: 'new-document-id' },
    });
    fireEvent.change(getByLabelText('Field'), {
      target: { value: 'foo' },
    });
    fireEvent.change(getByLabelText('Value'), {
      target: { value: 'bar' },
    });
  });

  act(() => getByText('Save').click());

  await waitForDialogsToClose();

  expect(onValue).toHaveBeenCalledWith({
    id: 'new-document-id',
    data: { foo: 'bar' },
  });
});

it('saves documentReference', async () => {
  const onValue = jest.fn();
  const { getByText, getByLabelText } = await renderDialogWithFirestore(
    async (firestore) => {
      const collectionRef = collection(firestore, 'things');
      return (
        <AddDocumentDialog
          open={true}
          collectionRef={collectionRef}
          onValue={onValue}
        />
      );
    }
  );

  await act(async () => {
    fireEvent.change(getByLabelText('Document ID'), {
      target: { value: 'new-document-id' },
    });
    fireEvent.change(getByLabelText('Field'), {
      target: { value: 'foo' },
    });
    fireEvent.change(getByLabelText('Type'), {
      target: { value: 'reference' },
    });
    fireEvent.change(getByLabelText('Value'), {
      target: { value: 'bar' }, // Expect fail because this isn't a valid documentId
    });
  });

  act(() => getByText('Save').click());

  await waitForDialogsToClose();

  expect(onValue).toHaveBeenCalledWith({
    id: 'new-document-id',
    data: { foo: 'bar' },
  });
});

it('emits null when [Cancel] is clicked', async () => {
  const onValue = jest.fn();
  const { getByText, getByLabelText } = await renderDialogWithFirestore(
    async (firestore) => {
      const collectionRef = collection(firestore, 'things');
      return (
        <AddDocumentDialog
          open={true}
          collectionRef={collectionRef}
          onValue={onValue}
        />
      );
    }
  );

  await act(async () => {
    fireEvent.change(getByLabelText('Document ID'), {
      target: { value: 'new-document-id' },
    });
  });

  act(() => getByText('Cancel').click());

  await waitForDialogsToClose();

  expect(onValue).toHaveBeenCalledWith(null);
});
