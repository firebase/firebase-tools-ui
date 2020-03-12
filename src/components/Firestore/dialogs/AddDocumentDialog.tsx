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

import React, { memo, useState, useCallback, useEffect } from 'react';
import {
  DialogButton,
  DialogProps,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogOnCloseEventT,
} from '@rmwc/dialog';
import { Theme } from '@rmwc/theme';
import { TextField } from '@rmwc/textfield';
import { firestore } from 'firebase';

export interface AddDocumentDialogValue {
  id: string;
  data: any;
}

export interface AddDocumentStepProps {
  collectionRef: firestore.CollectionReference;
  onChange: (value: AddDocumentDialogValue) => void;
}

export const AddDocumentStep = memo<AddDocumentStepProps>(
  ({ collectionRef, onChange }) => {
    const [id, setId] = useState(collectionRef.doc().id);
    const [json, setJson] = useState('{"a": "b"}');

    const getValue = useCallback(() => ({ id, data: JSON.parse(json) }), [
      id,
      json,
    ]);

    // emit initial value immediately (to capture auto generated doc id)
    useEffect(() => {
      onChange(getValue());
    }, [getValue, onChange]);

    const updateId = useCallback(
      (evt: React.ChangeEvent<HTMLInputElement>) => {
        setId(evt.target.value);
        onChange(getValue());
      },
      [setId, onChange, getValue]
    );

    const updateJson = useCallback(
      (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJson(evt.target.value);
        onChange(getValue());
      },
      [setJson, onChange, getValue]
    );

    return (
      <>
        <TextField
          id="add-document-path"
          fullwidth
          disabled
          label="Parent path"
          value={collectionRef.path}
        />
        <TextField
          id="add-document-id"
          fullwidth
          label="Document ID"
          value={id}
          onChange={updateId}
        />
        <TextField
          id="add-document-data"
          fullwidth
          label="JSON data"
          textarea
          value={json}
          onChange={updateJson}
        />
      </>
    );
  }
);

export interface Props extends DialogProps {
  collectionRef: firestore.CollectionReference;
  onValue: (v: AddDocumentDialogValue | null) => void;
}

export const AddDocumentDialog = memo<Props>(
  ({ collectionRef, onClose, onValue, ...dialogProps }) => {
    const [document, setDocument] = useState<AddDocumentDialogValue>({
      id: '',
      data: undefined,
    });

    const emitValueAndClose = useCallback(
      (evt: DialogOnCloseEventT) => {
        onValue(evt.detail.action === 'accept' ? document : null);
        onClose && onClose(evt);
      },
      [onValue, onClose, document]
    );

    return (
      <Dialog {...dialogProps} onClose={emitValueAndClose}>
        <DialogTitle>Add a document</DialogTitle>

        <DialogContent>
          <AddDocumentStep
            collectionRef={collectionRef}
            onChange={setDocument}
          />
        </DialogContent>

        <DialogActions>
          <Theme use={['textSecondaryOnBackground']} wrap>
            <DialogButton action="close">Cancel</DialogButton>
          </Theme>
          <DialogButton action="accept" isDefaultAction>
            Save
          </DialogButton>
        </DialogActions>
      </Dialog>
    );
  }
);
