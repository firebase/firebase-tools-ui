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

import { Card } from '@rmwc/card';
import { GridCell, GridRow } from '@rmwc/grid';
import { ThemeProvider } from '@rmwc/theme';
import React from 'react';

import { grey100 } from '../../../colors';
import { useSelectedFile } from '../api/useSelectedFile';
import { useStorageFiles } from '../api/useStorageFiles';
import { useMultiselect } from '../common/useMultiselect';
import { StorageItem } from '../types';
import SideBar from './SideBar/SideBar';
import styles from './StorageCard.module.scss';
import ActionHeader from './Table/Header/ActionHeader/ActionHeader';
import StorageHeader from './Table/Header/StorageHeader/StorageHeader';
import StorageTable from './Table/Table';

type File = StorageItem;
export const StorageCard: React.FC = () => {
  const { files } = useStorageFiles();

  const paths = files.map((file: File) => file.fullPath);
  const selection = useMultiselect<string>(paths);
  const [selectedFile, setSelectedFile] = useSelectedFile(files);

  return (
    <ThemeProvider options={{ surface: grey100 }}>
      <Card>
        {selection.selected.size === 0 ? (
          <StorageHeader />
        ) : (
          <ActionHeader selection={selection} />
        )}
        <div className={styles.tableWrapper}>
          <GridRow className={styles.gridWrapper}>
            <GridCell
              phone={selectedFile ? 1 : 12}
              tablet={selectedFile ? 4 : 12}
              desktop={selectedFile ? 9 : 12}
              className={styles.tableCell}
            >
              <ThemeProvider options={{ surface: '#fff' }}>
                <StorageTable
                  selection={selection}
                  selectedFile={selectedFile}
                  selectFile={setSelectedFile}
                />
              </ThemeProvider>
            </GridCell>
            {selectedFile && (
              <GridCell phone={3} tablet={4} desktop={3}>
                <SideBar
                  file={selectedFile}
                  closeSidebar={() => setSelectedFile(undefined)}
                />
              </GridCell>
            )}
          </GridRow>
        </div>
      </Card>
    </ThemeProvider>
  );
};

export default StorageCard;
