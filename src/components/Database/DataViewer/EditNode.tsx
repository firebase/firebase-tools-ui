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

import './EditNode.scss';

import {
  Card,
  CardActionButton,
  CardActionButtons,
  CardActions,
} from '@rmwc/card';
import { TextField } from '@rmwc/textfield';
import { Typography } from '@rmwc/typography';
import keycode from 'keycode';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import { getDbRootUrl, jsonIshValue } from './common/view_model';

export interface Props {
  value?: string | boolean | number;
  realtimeRef: firebase.database.Reference;
  isAdding?: boolean;
  onClose?: () => void;
}

export const EditNode = React.memo<Props>(function EditNode$({
  realtimeRef,
  isAdding,
  value,
  onClose,
}) {
  const pushId = realtimeRef.push().key!;
  const keyName = realtimeRef.key || getDbRootUrl(realtimeRef);
  const [form, setForm] = useState({
    value: isAdding ? '' : JSON.stringify(value) || '',
    keyName: isAdding ? pushId : keyName,
  });

  const updateFormField = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setForm({
      ...form,
      [target.name]: target.value,
    });
  };

  const closeOnEsc = (e: React.KeyboardEvent) => {
    e.keyCode === keycode('esc') && onClose && onClose();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newValue = jsonIshValue(form.value);
    isAdding
      ? realtimeRef.child(form.keyName).set(newValue)
      : realtimeRef.set(newValue);
    setTimeout(() => onClose && onClose(), 0);
  };

  const keyInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isAdding) {
      keyInputRef.current!.select();
    } else {
      valueInputRef.current!.select();
    }
  }, [isAdding]);

  return (
    <Card className="EditNode EditNode__card">
      <form
        className="EditNode__form"
        onSubmit={handleSubmit}
        onKeyDown={closeOnEsc}
      >
        <div className="EditNode__form-fields">
          {isAdding ? (
            <TextField
              outlined
              name="keyName"
              value={form.keyName}
              onChange={updateFormField}
              label="key"
              type="text"
              inputRef={keyInputRef}
            />
          ) : (
            <Typography use="body1" className="EditNode__key">
              {keyName}:{' '}
            </Typography>
          )}
          <TextField
            outlined
            name="value"
            value={form.value}
            onChange={updateFormField}
            label="value"
            type="text"
            inputRef={valueInputRef}
            placeholder="JSON or plain text"
          />
        </div>
        <CardActions className="EditNode__actions">
          <CardActionButtons>
            <CardActionButton
              theme="secondary"
              type="button"
              onClick={() => onClose && onClose()}
            >
              Cancel
            </CardActionButton>
            <CardActionButton unelevated type="submit">
              Save
            </CardActionButton>
          </CardActionButtons>
        </CardActions>
      </form>
    </Card>
  );
});
