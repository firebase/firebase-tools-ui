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

import React, { memo, useState, useCallback } from 'react';
import {
  DialogButton,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogOnCloseEventT,
} from '@rmwc/dialog';
import { Theme } from '@rmwc/theme';
import { firestore } from 'firebase';
import { TextField } from '@rmwc/textfield';
import { AddDocumentStep, AddDocumentDialogValue } from './AddDocumentDialog';
import DatabaseApi from '../api';

interface AddCollectionStepProps {
  documentRef?: firestore.DocumentReference;
  onChange: (value: string) => void;
}

export const AddCollectionStep = memo<AddCollectionStepProps>(
  ({ documentRef, onChange }) => {
    const [id, setId] = useState('');
    const updateId = useCallback(
      (evt: React.ChangeEvent<HTMLInputElement>) => {
        setId(evt.target.value);
        onChange(evt.target.value);
      },
      [setId, onChange]
    );

    return (
      <>
        <TextField
          fullwidth
          label="Parent path"
          value={documentRef ? documentRef.path.toString() : '/'}
          disabled
        />
        <TextField
          fullwidth
          label="Collection ID"
          value={id}
          onChange={updateId}
        />
      </>
    );
  }
);

export interface AddCollectionDialogValue {
  collectionId: string;
  document: AddDocumentDialogValue;
}

export interface AddCollectionDialogProps extends DialogProps {
  documentRef?: firestore.DocumentReference;
  api: DatabaseApi;
  onValue: (v: AddCollectionDialogValue | null) => void;
}

enum Step {
  COLLECTION,
  DOCUMENT,
}

export const AddCollectionDialog = memo<AddCollectionDialogProps>(
  ({ documentRef, api, onValue, onClose, ...dialogProps }) => {
    const [step, setStep] = useState(Step.COLLECTION);
    const [collectionId, setCollectionId] = useState('');
    const [document, setDocument] = useState<AddDocumentDialogValue>({
      id: '',
      data: undefined,
    });

    const next = useCallback(
      () => step === Step.COLLECTION && collectionId && setStep(step + 1),
      [setStep, step, collectionId]
    );

    const getValue = useCallback(
      () => ({
        collectionId,
        document,
      }),
      [collectionId, document]
    );

    const emitValueAndClose = useCallback(
      (evt: DialogOnCloseEventT) => {
        onValue(evt.detail.action === 'accept' ? getValue() : null);
        onClose && onClose(evt);
      },
      [onValue, onClose, getValue]
    );

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
              reference={
                documentRef
                  ? documentRef.collection(collectionId)
                  : api.database.collection(collectionId)
              }
              onChange={setDocument}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Theme use={['textSecondaryOnBackground']} wrap>
            <DialogButton action="close">Cancel</DialogButton>
          </Theme>
          {step === Step.DOCUMENT ? (
            <DialogButton action="accept" isDefaultAction>
              Save
            </DialogButton>
          ) : (
            <DialogButton onClick={next}>Next</DialogButton>
          )}
        </DialogActions>
      </Dialog>
    );
  }
);
