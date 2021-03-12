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

import { Select } from '@rmwc/select';
import React, { ChangeEvent } from 'react';

import { StorageIcon } from '../../../common/icons';
import { useBucket } from '../../api/useBucket';
import { useBuckets } from '../../api/useBuckets';
import styles from './BucketPicker.module.scss';

export const BucketPicker: React.FC = () => {
  const buckets = useBuckets();
  const [bucket, setBucket] = useBucket();

  return (
    <Select
      icon={<StorageIcon />}
      className={styles.bucketPicker}
      value={bucket}
      aria-label="Select bucket"
      options={buckets}
      onChange={(event: ChangeEvent<HTMLSelectElement>) => {
        setBucket(event.target.value);
      }}
    />
  );
};
