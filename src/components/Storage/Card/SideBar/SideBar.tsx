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

import { IconButton } from '@rmwc/icon-button';
import { Typography } from '@rmwc/typography';
import React, { KeyboardEvent } from 'react';

import { formatBytes } from '../../../common/formatBytes';
import { useStorageFiles } from '../../api/useStorageFiles';
import { StorageFileIcon } from '../../common/StorageFileIcon/StorageFileIcon';
import { StorageFile } from '../../types';
import { CustomMetadata } from './CustomMetadata/CustomMetadata';
import { FileLocation } from './FileLocation/FileLocation';
import styles from './SideBar.module.scss';
import { StoragePreview } from './StoragePreview/StoragePreview';

interface SideBarProps {
  file: StorageFile;
  closeSidebar: () => void;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ', ' + date.toLocaleTimeString();
}

export const SideBar: React.FC<SideBarProps> = ({ file, closeSidebar }) => {
  const { openAllFiles } = useStorageFiles();
  return (
    <aside className={styles.sideBarWrapper}>
      <div className={styles.headerWrapper}>
        <div className={styles.headerTitleWrapper}>
          <StorageFileIcon contentType={file.contentType} />
          <Typography
            className={styles.fileName}
            use="subtitle1"
            title={file.name}
          >
            {file.name}
          </Typography>
        </div>
        <IconButton
          theme="secondary"
          aria-label="Close"
          icon="close"
          onClick={closeSidebar}
        />
      </div>

      <StoragePreview file={file} />

      <dl className={styles.metadata}>
        <Typography use="body2" tag="dt" theme="secondary">
          Name
        </Typography>
        <Typography
          role="button"
          tabIndex="0"
          className={styles.openFileLink}
          use="body2"
          tag="dd"
          onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              return openAllFiles([file.fullPath]);
            }
          }}
          onClick={() => {
            return openAllFiles([file.fullPath]);
          }}
        >
          {file.name}
        </Typography>

        <Typography use="body2" tag="dt" theme="secondary">
          Size
        </Typography>
        <Typography use="body2" tag="dd">
          {formatBytes(file.size)}
        </Typography>

        <Typography use="body2" tag="dt" theme="secondary">
          Type
        </Typography>
        <Typography use="body2" tag="dd">
          {file.contentType}
        </Typography>

        <Typography use="body2" tag="dt" theme="secondary">
          Created
        </Typography>
        <Typography use="body2" tag="dd">
          {formatDate(file.timeCreated)}
        </Typography>

        <Typography use="body2" tag="dt" theme="secondary">
          Last modified
        </Typography>
        <Typography use="body2" tag="dd">
          {formatDate(file.updated)}
        </Typography>
      </dl>

      <FileLocation fullPath={file.fullPath}></FileLocation>
      <CustomMetadata metadata={file.customMetadata}></CustomMetadata>
    </aside>
  );
};
