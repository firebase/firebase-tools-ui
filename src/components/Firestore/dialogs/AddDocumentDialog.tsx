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
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogOnCloseEventT,
  DialogProps,
  DialogTitle,
} from '@rmwc/dialog';
import firebase from 'firebase';
import React, { useCallback, useEffect, useState } from 'react';

import { Field } from '../../common/Field';
import DocumentEditor from '../DocumentEditor';
import { FirestoreMap } from '../models';

export interface AddDocumentDialogValue {
  id: string;
  data: any;
}

export interface AddDocumentStepProps {
  collectionRef: firebase.firestore.CollectionReference;
  onChange: (value: AddDocumentDialogValue) => void;
}

export const AddDocumentStep: React.FC<AddDocumentStepProps> = ({
  collectionRef,
  onChange,
}) => {
  const [id, setId] = useState(collectionRef.doc().id);
  const [data, setData] = useState<FirestoreMap | undefined>();

  // TODO: Validation
  const getValue = useCallback(() => {
    try {
      return { id, data };
    } catch (e) {
      return { id, data: { invalidData: true } };
    }
  }, [id, data]);

  // emit initial value immediately (to capture auto generated doc id)
  useEffect(() => {
    onChange(getValue());
  }, [getValue, onChange]);

  const updateId = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setId(evt.target.value);
    onChange(getValue());
  };

  return (
    <>
      <Field
        id="add-document-path"
        fullwidth
        disabled
        label="Parent path"
        value={collectionRef.path}
      />
      <Field
        id="add-document-id"
        fullwidth
        label="Document ID"
        value={id}
        onChange={updateId}
        required
      />
      <DocumentEditor value={{ '': '' }} onChange={data => setData(data)} />
    </>
  );
};

interface Props extends DialogProps {
  collectionRef: firebase.firestore.CollectionReference;
  onValue: (v: AddDocumentDialogValue | null) => void;
}

export const AddDocumentDialog: React.FC<Props> = ({
  collectionRef,
  onClose,
  onValue,
  ...dialogProps
}) => {
  const [document, setDocument] = useState<AddDocumentDialogValue>({
    id: '',
    data: undefined,
  });

  const emitValueAndClose = (evt: DialogOnCloseEventT) => {
    onValue(evt.detail.action === 'accept' ? document : null);
    onClose && onClose(evt);
  };

  return (
    <Dialog {...dialogProps} onClose={emitValueAndClose}>
      <DialogTitle>Add a document</DialogTitle>

      <DialogContent>
        <AddDocumentStep collectionRef={collectionRef} onChange={setDocument} />
      </DialogContent>

      <DialogActions>
        <DialogButton action="close" type="button" theme="secondary">
          Cancel
        </DialogButton>
        <DialogButton
          unelevated
          action="accept"
          isDefaultAction
          disabled={!document.data}
        >
          Save
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};
