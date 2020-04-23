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
import * as React from 'react';
import { useState } from 'react';

import { Callout } from '../../common/Callout';
import { Field } from '../../common/Field';

export interface Props {
  reference: firebase.database.Reference;
  onComplete: (reference?: firebase.database.Reference, file?: File) => void;
}

export const ImportDialog: React.FC<Props> = ({ reference, onComplete }) => {
  const [file, setFile] = useState<File>();
  const onSubmit = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    file ? onComplete(reference, file) : onComplete();
  };

  const path = new URL(reference.toString()).pathname;

  return (
    <Dialog open>
      <form onSubmit={onSubmit}>
        <DialogTitle>Import JSON</DialogTitle>
        <DialogContent onSubmit={onSubmit}>
          <Callout aside type="warning">
            All data at this location will be overwritten
          </Callout>
          <Field
            disabled
            name="location"
            label="Data location"
            value={path}
            type="text"
          />
          <Field
            name="file"
            type="file"
            accept="application/json"
            label="Data (JSON)"
            value={file?.name}
            onChange={e => console.log('file', e.target)}
          />
        </DialogContent>
        <DialogActions>
          <DialogButton action="close" type="button" theme="secondary">
            Cancel
          </DialogButton>
          <DialogButton type="submit" unelevated>
            Import
          </DialogButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
