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
import { IconButton } from '@rmwc/icon-button';
import { Theme } from '@rmwc/theme';
import { Typography } from '@rmwc/typography';
import React from 'react';

import { CardActionBar } from '../../../../../common/CardActionBar';
import { useStorageFiles } from '../../../../api/useStorageFiles';
import { UseMultiselectResult } from '../../../../common/useMultiselect';
import { StorageItem } from '../../../../types';
import styles from './ActionHeader.module.scss';

interface ActionHeaderProps {
  selection: UseMultiselectResult;
}

function selectionIncludesFolders(
  files: StorageItem[],
  selection: Set<string>
) {
  return files.some(
    (file) => selection.has(file.fullPath) && file.type === 'folder'
  );
}

export const ActionHeader: React.FC<ActionHeaderProps> = ({ selection }) => {
  const { files, openAllFiles, deleteFiles } = useStorageFiles();
  const areFoldersSelected = selectionIncludesFolders(
    files,
    selection.selected as any
  );
  const paths = [...(selection.selected as Set<string>)];

  return (
    <CardActionBar className={styles.actionBar}>
      <Theme use={'textPrimaryOnDark'}>
        <div className={styles.actionHeaderWrapper}>
          <IconButton
            icon="close"
            label="Unselect all"
            onClick={() => selection.clearAll()}
          />
          <div className={styles.actionHeaderLabel}>
            <Typography use="body2">
              {selection.selected.size} item(s)
            </Typography>
          </div>
          <div>
            <Button
              className={styles.openButton}
              disabled={areFoldersSelected}
              onClick={() => {
                return openAllFiles(paths);
              }}
              unelevated
            >
              Open all files
            </Button>
            <Button
              onClick={() => {
                selection.clearAll();
                return deleteFiles(paths);
              }}
              className={styles.deleteButton}
              outlined
              unelevated
            >
              Delete
            </Button>
          </div>
        </div>
      </Theme>
    </CardActionBar>
  );
};
