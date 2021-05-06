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

import { Icon } from '@rmwc/icon';
import { Theme } from '@rmwc/theme';

import styles from './StorageIcon.module.scss';

export interface StorageIconProps {
  contentType: string;
}

const MIME_TYPE_ICON_MAP: Record<string, string> = {
  // adobe illustrator
  'application/illustrator': 'drive_ai',
  // microsoft word
  'application/msword': 'drive_ms_word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'drive_ms_word',
  // microsoft powerpoint
  'application/vnd.ms-powerpoint': 'drive_ms_powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'drive_ms_powerpoint',
  // microsoft excel
  'application/vnd.ms-excel': 'drive_ms_excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    'drive_ms_excel',
  // adobe acrobat
  'application/pdf': 'drive_pdf',
  // adobe photoshop
  'application/photoshop': 'drive_ps',
  'application/psd': 'drive_ps',
  'application/x-photoshop': 'drive_ps',
  'image/photoshop': 'drive_ps',
  'image/psd': 'drive_ps',
  'image/x-photoshop': 'drive_ps',
  'image/x-psd': 'drive_ps',
  // images
  'image/gif': 'photo',
  'image/jpg': 'photo',
  'image/jpeg': 'photo',
  'image/png': 'photo',
  'image/svg+xml': 'photo',
  'image/webp': 'photo',
  // audio
  'audio/m4a': 'drive_audio',
  'audio/mp3': 'drive_audio',
  'audio/mpeg': 'drive_audio',
  'audio/wav': 'drive_audio',
  'audio/x-ms-wma': 'drive_audio',
  // video
  'video/avi': 'drive_video',
  'video/mp4': 'drive_video',
  'video/mpeg': 'drive_video',
  'video/quicktime': 'drive_video',
  'video/x-ms-wmv': 'drive_video',
  // zip, csv, tsv
  'application/zip': 'drive_zip',
  'application/csv': 'csv',
  'text/csv': 'csv',
  'text/tsv': 'tsv',
  'text/tab-separated-values': 'tsv',
  // text documents
  'text/javascript': 'drive_document',
  'text/plain': 'drive_document',
  'text/x-log': 'drive_document',
} as const;

const DEFAULT_MIME_TYPE_ICON = 'drive_file';

export function getFileIcon(contentType: string) {
  return MIME_TYPE_ICON_MAP[contentType] || DEFAULT_MIME_TYPE_ICON;
}

export const StorageFileIcon: React.FC<StorageIconProps> = ({
  contentType,
}) => {
  return (
    <Theme use="secondary">
      <Icon icon={getFileIcon(contentType)} className={styles.icon} />
    </Theme>
  );
};
