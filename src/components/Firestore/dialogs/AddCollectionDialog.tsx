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
import { DocumentReference, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { useFirestore } from 'reactfire';

import { Field } from '../../common/Field';
import { AddDocumentDialogValue, AddDocumentStep } from './AddDocumentDialog';

interface AddCollectionInputProps {
  onChange: (value: string) => void;
}

export const AddCollectionInput = ({ onChange }: AddCollectionInputProps) => {
  const [id, setId] = useState('');
  const updateId = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setId(evt.target.value);
    onChange(evt.target.value);
  };

  return (
    <>
      <Field label="Collection ID" required value={id} onChange={updateId} />
    </>
  );
};

export interface AddCollectionDialogValue {
  collectionId: string;
  document: AddDocumentDialogValue;
}

interface Props extends DialogProps {
  documentRef?: DocumentReference;
  onValue: (v: AddCollectionDialogValue | null) => void;
}

export const AddCollectionDialog: React.FC<React.PropsWithChildren<Props>> = ({
  documentRef,
  onValue,
  onClose,
  ...dialogProps
}) => {
  const firestore = useFirestore();
  const [collectionId, setCollectionId] = useState('');
  const [document, setDocument] = useState<AddDocumentDialogValue>({
    id: '',
    data: undefined,
  });

  const getValue = () => ({
    collectionId,
    document,
  });

  const emitValueAndClose = (evt: DialogOnCloseEventT) => {
    onValue(evt.detail.action === 'accept' ? getValue() : null);
    onClose && onClose(evt);
  };

  function getCurrentOrPlaceholderCollectionId(collectionId: string) {
    return collectionId ? collectionId : '<parent Collection ID>';
  }

  return (
    <Dialog {...dialogProps} onClose={emitValueAndClose}>
      <DialogTitle>Start a collection</DialogTitle>

      <DialogContent>
        <AddCollectionInput onChange={setCollectionId} />
        <AddDocumentStep
          collectionRef={
            documentRef
              ? collection(
                  documentRef,
                  getCurrentOrPlaceholderCollectionId(collectionId)
                )
              : collection(
                  firestore,
                  getCurrentOrPlaceholderCollectionId(collectionId)
                )
          }
          onChange={setDocument}
        />
      </DialogContent>

      <DialogActions>
        <DialogButton action="close" type="button" theme="secondary">
          Cancel
        </DialogButton>
        <DialogButton
          unelevated
          action="accept"
          isDefaultAction
          disabled={!document.data || !document.id || !collectionId}
        >
          Save
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};
