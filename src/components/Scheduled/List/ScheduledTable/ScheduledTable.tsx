/**
 * Copyright 2022 Google LLC
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

import { DataTable, DataTableBody, DataTableContent } from '@rmwc/data-table';
import React from 'react';

import { ScheduledFunction } from '../../models';
import styles from './ScheduledTable.module.scss';
import { ScheduledTableRow } from './ScheduledTableRow';

export interface ScheduledTableProps {
  functions: ScheduledFunction[];
  setShowForceRunNotification: (show: boolean) => void;
}

export const ScheduledTable: React.FC<
  React.PropsWithChildren<ScheduledTableProps>
> = ({ functions, setShowForceRunNotification }) => {
  return (
    <DataTable className={styles.scheduledTable}>
      <DataTableContent>
        <DataTableBody>
          {functions.map((func) => (
            <ScheduledTableRow
              key={func.id}
              scheduledFunc={func}
              setShowForceRunNotification={setShowForceRunNotification}
            />
          ))}
        </DataTableBody>
      </DataTableContent>
    </DataTable>
  );
};
