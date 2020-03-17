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

import * as React from 'react';
import { useState } from 'react';
import { TextField } from '@rmwc/textfield';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogButton,
} from '@rmwc/dialog';
import { Typography } from '@rmwc/typography';
import { Theme } from '@rmwc/theme';

export interface Props {
  realtimeRef: firebase.database.Reference;
  isOpen: boolean;
  onComplete: () => void;
}

const cloneKey = (key: string, ref: firebase.database.Reference) => {
  return key.startsWith('-') ? ref.push().key! : `${key}_copy`;
};

export const CloneDialog = React.memo<Props>(function CloneDialog$({
  realtimeRef,
  isOpen,
  onComplete,
}) {
  const originalKey = realtimeRef.key!;
  const [newKey, setNewKey] = useState('');

  const [form, setForm] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const snapshot = await realtimeRef.once('value');
    const data: Record<string, string> = {};
    Object.entries(snapshot.val()).forEach(([key, val]) => {
      data[key] = JSON.stringify(val);
    });
    setForm(data);
    setNewKey(cloneKey(originalKey, realtimeRef));
    setIsLoading(false);
  };

  const updateField = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setForm({
      ...form,
      [target.name]: target.value,
    });
  };
  const onSubmit = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    const data: Record<string, any> = {};
    Object.entries(form).forEach(([key, value]) => {
      data[key] = JSON.parse(value);
    });
    realtimeRef.parent!.child(newKey).set(data);
    onComplete();
  };

  return (
    <Dialog open={isOpen} onClose={() => onComplete()} onOpen={loadData}>
      <form onSubmit={onSubmit}>
        <DialogTitle>Clone "{originalKey}"</DialogTitle>
        <DialogContent onSubmit={onSubmit}>
          <div>
            <label>New key:</label>
            <TextField
              value={newKey}
              onChange={e => setNewKey((e.target as HTMLInputElement).value)}
              type="text"
            />
          </div>

          <Typography use="headline6">Data</Typography>
          {isLoading
            ? 'Loading...'
            : Object.entries(form).map(([key, val]) => (
                <div key={key}>
                  <label>{key}:</label>
                  <TextField
                    name={key}
                    type="text"
                    value={val}
                    onChange={updateField}
                    placeholder="JSON or simple text"
                  />
                </div>
              ))}
        </DialogContent>
        <DialogActions>
          <Theme use={['textSecondaryOnBackground']} wrap>
            <DialogButton action="close">Cancel</DialogButton>
          </Theme>
          <DialogButton unelevated type="submit">
            Clone
          </DialogButton>
        </DialogActions>
      </form>
    </Dialog>
  );
});
