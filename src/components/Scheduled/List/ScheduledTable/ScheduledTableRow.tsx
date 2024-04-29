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

import { Button } from '@rmwc/button';
import { DataTableCell, DataTableRow } from '@rmwc/data-table';
import { Typography } from '@rmwc/typography';
import React, { useCallback } from 'react';

import { useEmulatorConfig } from '../../../common/EmulatorConfigProvider';
import { ScheduledIcon } from '../../../common/icons';
import { forceRunScheduledFunction } from '../../api/internal/useScheduledFunctions';
import { ScheduledFunction } from '../../models';
import styles from './ScheduledTableRow.module.scss';

export interface ScheduledTableRowProps {
  scheduledFunc: ScheduledFunction;
}

export const ScheduledTableRow: React.FC<
  React.PropsWithChildren<ScheduledTableRowProps>
> = ({ scheduledFunc }) => {
  const { hostAndPort } = useEmulatorConfig('functions');

  const handleClick = useCallback(
    () => forceRunScheduledFunction(scheduledFunc.id, hostAndPort),
    [scheduledFunc, hostAndPort]
  );

  return (
    <DataTableRow key={scheduledFunc.id} className={styles.scheduledRow}>
      <DataTableCell className={`${styles.iconCell} iconCell`}>
        {<ScheduledIcon theme="secondary" />}
      </DataTableCell>
      <DataTableCell className={styles.infoCell}>
        <div className={styles.infoHeader}>
          <Typography
            use="body1"
            theme="textPrimaryOnBackground"
            className="scheduledName"
          >
            {scheduledFunc.name}
          </Typography>
        </div>
        <div>
          <Typography use="body2" theme="textSecondaryOnBackground">
            {scheduledFunc.scheduleTrigger.schedule}
          </Typography>
        </div>
      </DataTableCell>
      <DataTableCell className={`${styles.actionCell} actionCell`}>
        <Button
          onClick={() => {
            handleClick.call(scheduledFunc.id);
          }}
          className={styles.manageButton}
          label={<div className={styles.manageButtonText}>Force run</div>}
          aria-label={'Force run'}
        />
      </DataTableCell>
    </DataTableRow>
  );
};
