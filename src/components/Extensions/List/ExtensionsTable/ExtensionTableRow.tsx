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
import React from 'react';
import { useHistory } from 'react-router-dom';

import { Extension } from '../../models';
import styles from './ExtensionTableRow.module.scss';

export interface ExtensionsTableRowProps {
  extension: Extension;
}

export const ExtensionsTableRow: React.FC<
  React.PropsWithChildren<ExtensionsTableRowProps>
> = ({ extension }) => {
  const history = useHistory();

  return (
    <DataTableRow key={extension.ref} className={styles.extensionRow}>
      <DataTableCell className={`${styles.iconCell} iconCell`}>
        <img
          src={extension.iconUri}
          aria-hidden={true}
          className="extensionLogo"
          alt="Extension logo"
        />
      </DataTableCell>
      <DataTableCell className={styles.infoCell}>
        <div className={styles.infoHeader}>
          {extension.publisherIconUri && (
            <img
              className="publisherLogo"
              aria-hidden={true}
              alt="Publisher logo"
              src={extension.publisherIconUri}
            />
          )}
          <Typography
            use="body1"
            theme="textPrimaryOnBackground"
            className="extensionName"
          >
            {extension.displayName}
          </Typography>
        </div>
        <div>
          <Typography use="body2" theme="textSecondaryOnBackground">
            {extension.ref}
          </Typography>
        </div>
      </DataTableCell>
      <DataTableCell className={`${styles.actionCell} actionCell`}>
        <Button
          onClick={() => {
            history.push(`/extensions/${extension.id}`);
          }}
          className={styles.manageButton}
          label={<div className={styles.manageButtonText}>Manage</div>}
          title={`Manage the ${extension.displayName} extension.`}
          trailingIcon="arrow_forward"
        />
      </DataTableCell>
    </DataTableRow>
  );
};
