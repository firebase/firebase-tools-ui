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

import { Tooltip } from '@rmwc/tooltip';
import React from 'react';

import { CardActionBar } from '../../../../../common/CardActionBar';
import { CopyButton } from '../../../../../common/CopyButton';
import { InteractiveBreadCrumbBar } from '../../../../../common/InteractiveBreadCrumbBar';
import { useBucket } from '../../../../api/useBucket';
import { usePath } from '../../../../api/usePath';
import { storagePath } from '../../../../common/constants';
import { CreateFolder } from './CreateFolder/CreateFolder';
import styles from './StorageHeader.module.scss';
import { UploadButton } from './UploadButton/UploadButton';

export const StorageHeader: React.FC = () => {
  const [path, setPath] = usePath();
  const [bucket] = useBucket();

  const bucketRoot = `gs://${bucket}`;

  return (
    <div className={styles.storageHeaderActionBarWrapper}>
      <CardActionBar>
        <div className={styles.storageHeaderWrapper}>
          <Tooltip content="Copy URL to clipboard">
            {/*Without div tooltip is not displayed*/}
            <div>
              <CopyButton textToCopy={bucketRoot + '/' + path} icon="link" />
            </div>
          </Tooltip>
          <div className={styles.wrapper}>
            <div className={styles.breadcrumbWrapper}>
              <InteractiveBreadCrumbBar
                inputPrefix={bucketRoot + '/'}
                onNavigate={setPath}
                base={storagePath + bucket}
                path={path}
                homeElement={bucketRoot}
              />
            </div>
          </div>
          <CreateFolder />
          <UploadButton />
        </div>
      </CardActionBar>
    </div>
  );
};
