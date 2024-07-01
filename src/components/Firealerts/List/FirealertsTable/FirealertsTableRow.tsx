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

import { DataTableCell, DataTableRow } from '@rmwc/data-table';
import { Typography } from '@rmwc/typography';

import { FirealertsTrigger } from '../../models';
import styles from './FirealertsTableRow.module.css';
import { useHistory } from 'react-router';

export interface FirealertsTableRowProps {
  firealertsTrigger: FirealertsTrigger;
}

export const FirealertsTableRow: React.FC<
  React.PropsWithChildren<FirealertsTableRowProps>
> = ({ firealertsTrigger }) => {
  const history = useHistory();


  return (
    <DataTableRow 
      key={firealertsTrigger.triggerName} 
      className={styles.scheduledRow} 
      onClick={() => history.push(`/firealerts/${firealertsTrigger.eventTrigger.eventFilters.alerttype}`)}
      >
      <DataTableCell className={styles.infoCell}>
        <div className={styles.infoHeader}>
          <Typography
            use="body1"
            theme="textPrimaryOnBackground"
            className="scheduledName"
          >
            {firealertsTrigger.triggerName}
          </Typography>
        </div>
        <div>
          <Typography use="body2" theme="textSecondaryOnBackground">
            {firealertsTrigger.eventTrigger.eventFilters.alerttype}
          </Typography>
        </div>
      </DataTableCell>
    </DataTableRow >
  );
};