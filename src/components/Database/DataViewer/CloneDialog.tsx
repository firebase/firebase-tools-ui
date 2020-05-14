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

import { ok } from 'assert';

import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from '@rmwc/dialog';
import { TextField } from '@rmwc/textfield';
import { Typography } from '@rmwc/typography';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { Field } from '../../common/Field';

export interface Props {
  realtimeRef: firebase.database.Reference;
  /**
   * Called when complete, if the data was cloned the key is returned, else
   * undefined.
   */
  onComplete: (string?: string) => void;
}

/**
 * Strips protocol and domain name (usually http://localhost:9000/)
 * from the ref's path
 * @example "localhost:9000/todos/one" -> "/todos/one"
 * @param ref
 */
const getAbsoluteRefPath = (ref: firebase.database.Reference) => {
  return `/${ref.toString().replace(ref.root.toString(), '')}`;
};

/**
 * Returns a key value that is either a new push id if the current
 * ref's key is a push id or a "copy" key if not.
 * @param key
 * @param ref
 */
const cloneKey = (key: string, ref: firebase.database.Reference) => {
  return key.startsWith('-')
    ? `${getAbsoluteRefPath(ref.parent!)}/${ref.push().key!}`
    : `${getAbsoluteRefPath(ref)}_copy`;
};

export const CloneDialog = React.memo<Props>(function CloneDialog$({
  realtimeRef,
  onComplete,
}) {
  ok(realtimeRef.parent, 'Cannot clone the root node!');

  const originalKey = realtimeRef.key!;
  const [newKey, setNewKey] = useState('');

  const [form, setForm] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const snapshot = await realtimeRef.once('value');

      const data: Record<string, string> = {};
      Object.entries(snapshot.val() || {}).forEach(([key, val]) => {
        data[key] = JSON.stringify(val);
      });
      setForm(data);
      setNewKey(cloneKey(originalKey, realtimeRef));
      setIsLoading(false);
    };
    loadData();
  }, [setIsLoading, setForm, setNewKey, originalKey, realtimeRef]);

  const updateField = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setForm({
      ...form,
      [target.name]: target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    const data: Record<string, any> = {};
    Object.entries(form).forEach(([key, value]) => {
      data[key] = JSON.parse(value);
    });
    realtimeRef.root.child(newKey).set(data);
    onComplete(newKey);
  };

  return (
    <Dialog open>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Clone "{originalKey}"</DialogTitle>
        <DialogContent>
          <Field
            label="New key:"
            value={newKey}
            onChange={e => setNewKey((e.target as HTMLInputElement).value)}
            type="text"
          />

          <Typography use="headline6">Data</Typography>
          {isLoading
            ? 'Loading...'
            : Object.entries(form).map(([key, val]) => (
                <div key={key}>
                  <label>
                    {key}:
                    <TextField
                      name={key}
                      type="text"
                      value={val}
                      onChange={updateField}
                      placeholder="JSON or simple text"
                    />
                  </label>
                </div>
              ))}
        </DialogContent>
        <DialogActions>
          <DialogButton
            type="button"
            action="close"
            theme="secondary"
            onClick={() => onComplete()}
          >
            Cancel
          </DialogButton>
          <DialogButton unelevated action="accept">
            Clone
          </DialogButton>
        </DialogActions>
      </form>
    </Dialog>
  );
});
