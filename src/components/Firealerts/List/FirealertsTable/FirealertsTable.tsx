import { DataTable, DataTableBody, DataTableContent } from '@rmwc/data-table';
import React from 'react';

import { FirealertsTrigger } from '../../models';
import styles from './FirealertsTable.module.scss'
import { FirealertsTableRow } from "./FirealertsTableRow"

export interface FirealertsTableProps {
  functions: FirealertsTrigger[];
}

export const FirealertsTable: React.FC<
  React.PropsWithChildren<FirealertsTableProps>
> = ({ functions }) => {
  return (
    <DataTable className={styles.scheduledTable}>
      <DataTableContent>
        <DataTableBody>
          {functions.map((func) => (
              <FirealertsTableRow
                key={func.triggerName}
                firealertsTrigger={func}
              />
          ))}
        </DataTableBody>
      </DataTableContent>
    </DataTable>
  );
};