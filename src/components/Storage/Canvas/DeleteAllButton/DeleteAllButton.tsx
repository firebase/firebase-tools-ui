/**
 * Copyright 2021 Google LLC
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

import { Button } from '@rmwc/button';
import React, { Suspense } from 'react';

import { CustomThemeProvider } from '../../../../themes';
import { useStorageFiles } from '../../api/useStorageFiles';
import { confirmDeleteAllFiles } from './confirmDeleteAllFiles';
import styles from './DeleteAllButton.module.scss';

export const DeleteAllButton: React.FC = () => {
  return (
    // While we don't know the state of the button, show it as disabled.
    <Suspense
      fallback={
        <DeleteAllButtonUnwrapped deleteAllFiles={() => {}} disabled={true} />
      }
    >
      <DeleteAllButtonWithHooks />
    </Suspense>
  );
};

const DeleteAllButtonWithHooks: React.FC = () => {
  const { deleteAllFiles, bucketHasAnyFiles } = useStorageFiles();

  return (
    <DeleteAllButtonUnwrapped
      disabled={!bucketHasAnyFiles}
      deleteAllFiles={deleteAllFiles}
    />
  );
};

interface DeleteAllButtonUnwrappedProps {
  deleteAllFiles: () => void;
  disabled: boolean;
}

const DeleteAllButtonUnwrapped: React.FC<DeleteAllButtonUnwrappedProps> = ({
  deleteAllFiles,
  disabled,
}) => {
  return (
    <CustomThemeProvider use="warning" wrap>
      <Button
        className={styles.deleteAllFiles}
        disabled={disabled}
        unelevated
        onClick={async () => {
          if (await confirmDeleteAllFiles()) {
            deleteAllFiles();
          }
        }}
      >
        Delete all files
      </Button>
    </CustomThemeProvider>
  );
};
