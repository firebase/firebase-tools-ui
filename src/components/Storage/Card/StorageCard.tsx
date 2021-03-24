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
import { Elevation } from '@rmwc/elevation';
import { GridCell, GridRow } from '@rmwc/grid';
import { ThemeProvider } from '@rmwc/theme';
import React from 'react';

import { grey100 } from '../../../colors';
import { useStorageFiles } from '../api/useStorageFiles';
import { useMultiselect } from '../common/useMultiselect';
import { StorageItem } from '../types';
import { SideBar } from './SideBar/SideBar';
import styles from './StorageCard.module.scss';
import { ActionHeader } from './Table/Header/ActionHeader/ActionHeader';
import { StorageHeader } from './Table/Header/StorageHeader/StorageHeader';
import { StorageTable } from './Table/Table';
import { TableDropzoneWrapper } from './TableDropzoneWrapper/TableDropzoneWrapper';
import { useSelectedFile } from './useSelectedFile/useSelectedFile';

type File = StorageItem;
export const StorageCard: React.FC = () => {
  const { files } = useStorageFiles();
  const paths = files.map((file: File) => file.fullPath);
  const selection = useMultiselect<string>(paths);
  const [selectedFile, setSelectedFile] = useSelectedFile(files);

  return (
    <ThemeProvider options={{ surface: grey100 }}>
      <Elevation z="2" wrap>
        <Card>
          {selection.selected.size === 0 ? (
            <StorageHeader />
          ) : (
            <ActionHeader selection={selection} />
          )}
          <div className={styles.tableWrapper}>
            <GridRow className={styles.gridWrapper}>
              <GridCell
                phone={selectedFile ? 1 : 4}
                tablet={selectedFile ? 4 : 8}
                desktop={selectedFile ? 8 : 12}
                className={styles.tableCell}
              >
                <ThemeProvider options={{ surface: '#fff' }}>
                  <TableDropzoneWrapper>
                    <StorageTable
                      selection={selection}
                      selectedFile={selectedFile}
                      selectFile={setSelectedFile}
                    />
                  </TableDropzoneWrapper>
                </ThemeProvider>
              </GridCell>
              {selectedFile && (
                <GridCell phone={3} tablet={4} desktop={4}>
                  <SideBar
                    file={selectedFile}
                    closeSidebar={() => setSelectedFile(undefined)}
                  />
                </GridCell>
              )}
            </GridRow>
          </div>
        </Card>
      </Elevation>
    </ThemeProvider>
  );
};
