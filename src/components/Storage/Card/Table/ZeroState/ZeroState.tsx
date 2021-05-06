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

import { Typography } from '@rmwc/typography';
import React from 'react';
import { useDropzone } from 'react-dropzone';

import { useStorageFiles } from '../../../api/useStorageFiles';
import styles from './ZeroState.module.scss';

export const ZeroState: React.FC = () => {
  const { uploadFiles } = useStorageFiles();

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    onDrop: async (files) => {
      await uploadFiles(files);
    },
  });

  return (
    <div className={styles.zeroStateWrapper} {...getRootProps()}>
      {isDragActive ? (
        <Typography use="body2" theme="secondary">
          Drop files here
        </Typography>
      ) : (
        <div>
          <Typography use="body1" theme="secondary" tag="div">
            No files found
          </Typography>
          <Typography use="body2" theme="secondary" tag="div">
            Drag and drop files to upload
          </Typography>
        </div>
      )}

      <input {...getInputProps()} />
    </div>
  );
};
