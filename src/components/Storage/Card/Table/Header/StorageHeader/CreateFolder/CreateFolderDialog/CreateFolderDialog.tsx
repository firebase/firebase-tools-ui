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
import React, { FormEvent, useReducer } from 'react';

import { Field } from '../../../../../../../common/Field';

interface NewFolderDialogProps {
  confirm: (folder: string) => void;
  close: () => void;
  isOpen: boolean;
}

// This is the limit on the back-end.
const MAX_FOLDER_NAME_LENGTH = 252;

export const CreateFolderDialog: React.FC<NewFolderDialogProps> = ({
  confirm,
  isOpen,
  close,
}) => {
  const [name, setName] = useReducer(
    (s: string, value: string) => value.trim(),
    ''
  );

  const createFolder = () => {
    confirm(name);
    close();
  };

  return (
    <Dialog open={isOpen} onClose={() => close()}>
      <DialogTitle>Create folder</DialogTitle>

      <DialogContent>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            createFolder();
          }}
        >
          <Field
            maxLength={MAX_FOLDER_NAME_LENGTH}
            onChange={(e: FormEvent<HTMLInputElement>) => {
              setName((e.target as HTMLInputElement).value);
            }}
            required
            label="New folder name"
          />
        </form>
      </DialogContent>

      <DialogActions>
        <DialogButton type="button" theme="secondary" onClick={close}>
          Cancel
        </DialogButton>

        <DialogButton disabled={name === ''} unelevated onClick={createFolder}>
          Create
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};
