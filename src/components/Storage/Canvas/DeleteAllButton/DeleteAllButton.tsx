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

import { CustomThemeProvider } from '../../../../themes';
import { confirmDeleteAllFiles } from './confirmDeleteAllFiles';
import styles from './DeleteAllButton.module.scss';

interface DeleteAllButtonProps {
  deleteAllFiles: () => void;
}

export const DeleteAllButton: React.FC<
  React.PropsWithChildren<DeleteAllButtonProps>
> = ({ deleteAllFiles }) => {
  return (
    <CustomThemeProvider use="warning" wrap>
      <Button
        className={styles.deleteAllFiles}
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
