import { RenderResult } from '@testing-library/react';

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
