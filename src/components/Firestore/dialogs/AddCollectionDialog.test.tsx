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

import {
  RenderResult,
  fireEvent,
  waitForElement,
} from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';

import { delay, waitForDialogsToClose } from '../../../test_utils';
import { renderWithFirestore } from '../testing/FirestoreTestProviders';
import { renderDialogWithFirestore } from '../testing/test_utils';
import { AddCollectionDialog } from './AddCollectionDialog';

it('shows correct title', async () => {
  const promise = Promise.resolve();
  const onValue = jest.fn(() => promise);

  const { getByText } = await renderWithFirestore(async () => (
    <AddCollectionDialog open={true} onValue={onValue} />
  ));

  await waitForElement(() => getByText(/Start a collection/));
});

describe('step 1', () => {
  it('displays the parent document path', async () => {
    const { getByLabelText } = await renderDialogWithFirestore(
      async firestore => {
        const docRef = firestore.doc('docs/my-doc');
        return (
          <AddCollectionDialog
            open={true}
            documentRef={docRef}
            onValue={() => {}}
          />
        );
      }
    );

    expect(getByLabelText(/Parent path/).value).toBe('docs/my-doc');
  });

  it('contains a collection id input', async () => {
    const { getByLabelText } = await renderDialogWithFirestore(async () => (
      <AddCollectionDialog open={true} onValue={() => {}} />
    ));

    expect(getByLabelText(/Collection ID/)).not.toBeNull();
  });
}); // step 1

describe('step 2', () => {
  let result: RenderResult;
  let onValue: jest.Mock;

  beforeEach(async () => {
    onValue = jest.fn();
    result = await renderDialogWithFirestore(async firestore => {
      const docRef = firestore.doc('docs/my-doc');
      return (
        <AddCollectionDialog
          open={true}
          documentRef={docRef}
          onValue={onValue}
        />
      );
    });
    const { getByText, getByLabelText } = result;

    fireEvent.change(getByLabelText(/Collection ID/), {
      target: { value: 'my-col' },
    });

    await act(async () => {
      getByText('Next').click();
      // Wait for async Dialogs DOM changes for the second step dialog.
      await delay(100);
    });
  });

  it('displays the parent collection path', () => {
    const { getByLabelText } = result;

    expect(getByLabelText(/Parent path/).value).toBe('docs/my-doc/my-col');
  });

  it('contains a document id with random id', () => {
    const { getByLabelText } = result;

    expect(getByLabelText(/Document ID/).value).toMatch(/^\w{20}$/);
  });

  it('contains a data input', () => {
    const { getByLabelText } = result;

    expect(getByLabelText('Field')).not.toBeNull();
  });

  // TODO testing suggests that the button is infact disabed by inspecting the DOM
  // but triggering a click event still triggers the underlying event. This is no
  // reproducible in the actual GUI.
  it.skip('[Save] is disabled if invalid doc-data', async () => {
    const { getByLabelText, getByText } = result;

    await act(async () => {
      getByText('Save').click();
    });

    expect(onValue).not.toHaveBeenCalled();
  });

  it('emits doc data when clicking [Save]', async () => {
    const { getByLabelText, getByText } = result;
    const randomId = getByLabelText(/Document ID/).value;

    await act(async () => {
      fireEvent.change(getByLabelText('Field'), {
        target: { value: 'valid' },
      });
    });

    act(() => getByText('Save').click());
    await waitForDialogsToClose();

    expect(onValue).toHaveBeenCalledWith({
      collectionId: 'my-col',
      document: {
        id: randomId,
        data: { valid: '' },
      },
    });
  });

  it('emits null when clicking [Cancel]', async () => {
    const { getByText } = result;

    act(() => getByText('Cancel').click());
    await waitForDialogsToClose();

    expect(onValue).toHaveBeenCalledWith(null);
  });
}); // step 2

describe('at the root of the db', () => {
  it('shows the correct parent path', async () => {
    const { getByLabelText } = await renderDialogWithFirestore(async () => (
      <AddCollectionDialog open={true} onValue={() => {}} />
    ));

    expect(getByLabelText(/Parent path/).value).toBe('/');
  });
}); // at the root of the db
