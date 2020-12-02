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
  DialogTitle,
} from '@rmwc/dialog';
import firebase from 'firebase';
import * as React from 'react';
import { useState } from 'react';

import { Field } from '../../common/Field';

export interface Props {
  realtimeRef: firebase.database.Reference;
  isOpen: boolean;
  onComplete: (didRename: boolean) => void;
}

export const RenameDialog = React.memo<Props>(function RenameDialog$({
  realtimeRef,
  isOpen,
  onComplete,
}) {
  const originalKey = realtimeRef.key!;
  const [form, setForm] = useState<Record<string, string>>({
    newKey: originalKey,
  });

  const updateField = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setForm({
      ...form,
      [target.name]: target.value,
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    const snap = await realtimeRef.once('value');
    try {
      await realtimeRef.parent!.update({
        [form.newKey]: snap.val(),
        [originalKey]: null,
      });
    } catch (e) {
      // TODO: handle error state
    }
    onComplete(true);
  };

  return (
    <Dialog open={isOpen} onClose={() => onComplete(false)}>
      <form onSubmit={onSubmit}>
        <DialogTitle>Rename "{originalKey}"</DialogTitle>
        <DialogContent onSubmit={onSubmit}>
          <Field
            name="newKey"
            label="New key:"
            value={form.newKey}
            onChange={updateField}
            type="text"
          />
        </DialogContent>
        <DialogActions>
          <DialogButton action="close" type="button" theme="secondary">
            Cancel
          </DialogButton>
          <DialogButton type="submit" unelevated>
            Rename
          </DialogButton>
        </DialogActions>
      </form>
    </Dialog>
  );
});
