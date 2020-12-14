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

import { RenderResult } from '@testing-library/react';
import firebase from 'firebase';

import { waitForDialogsToOpen } from '../../../test_utils';
import { renderWithFirestore } from './FirestoreTestProviders';

/*
 * Render a component containing a MDC dialog, and wait for the dialog to be
 * fully open. Silences act(...) warnings from RMWC <Dialog>s.
 *
 * This is syntatic sugar for render() and then waitForDialogsToOpen().
 */
export async function renderDialogWithFirestore(
  ui: (firestore: firebase.firestore.Firestore) => Promise<React.ReactElement>
): Promise<RenderResult> {
  const result = await renderWithFirestore(ui);
  await waitForDialogsToOpen(result.container);
  return result;
}
