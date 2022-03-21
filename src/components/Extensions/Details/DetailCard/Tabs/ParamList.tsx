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
import { Tooltip } from '@rmwc/tooltip';
import { Typography } from '@rmwc/typography';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import { Accordion } from '../../../../common/Accordion';
import { useExtension } from '../../../api/useExtension';
import styles from './ParamList.module.scss';
import { ParamValue } from './ParamValue';

function ParamList() {
  const extension = useExtension()!;
  return (
    <div>
      <div className={styles.paramHeader}>
        <Tooltip
          content={
            <div style={{ width: '400px' }}>
              Reconfigure is not available on emulated experiences. You can
              however reconfigure parameters by updating your .env files.
            </div>
          }
        >
          <Button outlined theme="secondary">
            Reconfigure extension
          </Button>
        </Tooltip>
      </div>
      {(extension.params || []).map((param) => {
        return (
          <div key={param.param} className={styles.paramWrapper}>
            <Accordion
              expansionLabel="Description"
              title={
                <Typography use="body2" theme="secondary">
                  {param.label}
                </Typography>
              }
            >
              <Typography
                className={styles.description}
                use="caption"
                tag="div"
                theme="secondary"
              >
                <ReactMarkdown>{param.description || ''}</ReactMarkdown>
              </Typography>
            </Accordion>

            <ParamValue
              value={param.value || param.default || ''}
              type={param.type}
            />
          </div>
        );
      })}
    </div>
  );
}

export default ParamList;
