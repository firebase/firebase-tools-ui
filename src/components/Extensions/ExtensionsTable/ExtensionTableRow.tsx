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
import { IconButton } from '@rmwc/icon-button';
import { Typography } from '@rmwc/typography';
import React from 'react';

import { ExtensionLink } from '../index';
import { Extension } from '../models';
import styles from './ExtensionTableRow.module.scss';

export interface ExtensionsTableRowProps {
  extension: Extension;
}

export const ExtensionsTableRow: React.FC<ExtensionsTableRowProps> = ({
  extension,
}) => {
  return (
    <DataTableRow key={extension.ref}>
      <DataTableCell className={styles.iconCell + ' iconCell'}>
        <img
          src={extension.iconUri}
          aria-hidden={true}
          className="extensionLogo"
          alt="Extension logo"
        />
      </DataTableCell>
      <DataTableCell className={styles.infoCell}>
        <div className={styles.infoHeader}>
          <img
            className="publisherLogo"
            aria-hidden={true}
            alt="Publisher logo"
            src={extension.publisherIconUri}
          />
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
      <DataTableCell className="actionCell">
        <ExtensionLink instanceId={extension.id}>
          <IconButton theme="primary" icon="arrow_forward" />
        </ExtensionLink>
      </DataTableCell>
    </DataTableRow>
  );
};
