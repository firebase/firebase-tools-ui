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
import React, { useState } from 'react';
import { useFirestore } from 'reactfire';

import { Field } from '../../common/Field';
import { AddDocumentDialogValue, AddDocumentStep } from './AddDocumentDialog';

interface AddCollectionStepProps {
  documentRef?: firebase.firestore.DocumentReference;
  onChange: (value: string) => void;
}

export const AddCollectionStep = ({
  documentRef,
  onChange,
}: AddCollectionStepProps) => {
  const [id, setId] = useState('');
  const updateId = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setId(evt.target.value);
    onChange(evt.target.value);
  };

  return (
    <>
      <Field
        label="Parent path"
        value={documentRef ? documentRef.path : '/'}
        disabled
      />

      <Field label="Collection ID" required value={id} onChange={updateId} />
    </>
  );
};

export interface AddCollectionDialogValue {
  collectionId: string;
  document: AddDocumentDialogValue;
}

interface Props extends DialogProps {
  documentRef?: firebase.firestore.DocumentReference;
  onValue: (v: AddCollectionDialogValue | null) => void;
}

enum Step {
  COLLECTION,
  DOCUMENT,
}

export const AddCollectionDialog: React.FC<Props> = ({
  documentRef,
  onValue,
  onClose,
  ...dialogProps
}) => {
  const firestore = useFirestore();
  const [step, setStep] = useState(Step.COLLECTION);
  const [collectionId, setCollectionId] = useState('');
  const [document, setDocument] = useState<AddDocumentDialogValue>({
    id: '',
    data: undefined,
  });

  const next = () =>
    step === Step.COLLECTION && collectionId && setStep(step + 1);

  const getValue = () => ({
    collectionId,
    document,
  });

  const emitValueAndClose = (evt: DialogOnCloseEventT) => {
    onValue(evt.detail.action === 'accept' ? getValue() : null);
    onClose && onClose(evt);
  };

  return (
    <Dialog {...dialogProps} onClose={emitValueAndClose}>
      <DialogTitle>Start a collection</DialogTitle>

      <DialogContent>
        {step === Step.COLLECTION ? (
          <AddCollectionStep
            documentRef={documentRef}
            onChange={setCollectionId}
          />
        ) : (
          <AddDocumentStep
            collectionRef={
              documentRef
                ? documentRef.collection(collectionId)
                : firestore.collection(collectionId)
            }
            onChange={setDocument}
          />
        )}
      </DialogContent>

      <DialogActions>
        <DialogButton action="close" type="button" theme="secondary">
          Cancel
        </DialogButton>
        {step === Step.DOCUMENT ? (
          <DialogButton
            unelevated
            action="accept"
            isDefaultAction
            disabled={!document.data}
          >
            Save
          </DialogButton>
        ) : (
          <DialogButton unelevated onClick={next}>
            Next
          </DialogButton>
        )}
      </DialogActions>
    </Dialog>
  );
};
