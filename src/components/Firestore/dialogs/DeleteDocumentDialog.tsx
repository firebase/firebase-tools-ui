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

import { Checkbox } from '@rmwc/checkbox';
import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogOnCloseEventT,
  DialogProps,
  DialogTitle,
} from '@rmwc/dialog';
import firebase from 'firebase';
import React, { useState } from 'react';

import { Callout } from '../../common/Callout';
import { Field } from '../../common/Field';

interface DeleteDocumentOptions {
  recursive: boolean;
}

interface Props extends DialogProps {
  documentRef: firebase.firestore.DocumentReference;
  onConfirm: (options: DeleteDocumentOptions) => void;
}

export const DeleteDocumentDialog: React.FC<Props> = ({
  documentRef,
  onConfirm,
  onClose,
  ...dialogProps
}) => {
  const [recursive, setRecursive] = useState(false);
  const emitValueAndClose = (evt: DialogOnCloseEventT) => {
    if (evt.detail.action === 'accept') {
      onConfirm({ recursive });
    }
    onClose && onClose(evt);
  };

  return (
    <Dialog {...dialogProps} onClose={emitValueAndClose}>
      <DialogTitle>Delete document</DialogTitle>

      <DialogContent>
        <div className="Firestore--dialog-body">
          <Callout aside type="warning">
            This will permanently delete the document.
          </Callout>
          <Field
            label="Document location"
            value={`/${documentRef.path}`}
            disabled
          />
          <div>
            <Checkbox
              label="Also delete nested collections and documents"
              checked={recursive}
              onChange={(event) => {
                setRecursive(event.currentTarget.checked);
              }}
            />
          </div>
          {recursive && (
            <Callout aside type="note">
              Cloud Functions triggers <b>will not</b> be executed.
            </Callout>
          )}
        </div>
      </DialogContent>

      <DialogActions>
        <DialogButton action="close" type="button" theme="secondary">
          Cancel
        </DialogButton>
        <DialogButton unelevated action="accept" isDefaultAction danger>
          Delete
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};
