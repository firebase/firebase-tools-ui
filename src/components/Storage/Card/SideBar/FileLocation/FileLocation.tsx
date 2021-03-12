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

import { Button } from '@rmwc/button';
import { IconButton } from '@rmwc/icon-button';
import { MenuItem, SimpleMenu } from '@rmwc/menu';
import { Tooltip } from '@rmwc/tooltip';
import { Typography } from '@rmwc/typography';
import React, { KeyboardEvent } from 'react';

import { Accordion } from '../../../../common/Accordion';
import { useClipboard } from '../../../../common/CopyButton';
import { useStorageFiles } from '../../../api/useStorageFiles';
import { useTokens } from '../../../api/useTokens';
import styles from './FileLocation.module.scss';

interface FileLocationProps {
  fullPath: string;
}

export const FileLocation: React.FC<FileLocationProps> = ({ fullPath }) => {
  const { tokens, createToken, deleteToken } = useTokens(fullPath);
  const { getLocation } = useStorageFiles();
  const { writeText } = useClipboard();

  return (
    <Accordion title="File location">
      <dl className={styles.metadata}>
        <Typography use="body2" tag="dt" theme="secondary">
          File location
        </Typography>
        <Typography use="body2" tag="dd" className={styles.location}>
          {getLocation(fullPath)}
        </Typography>
        {tokens.map((token) => (
          <div key={token}>
            <Typography use="body2" tag="dt" theme="secondary">
              Access token
              <SimpleMenu
                handle={<IconButton icon="more_vert" label="Open menu" />}
                renderToPortal
              >
                <MenuItem
                  onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      deleteToken(token);
                    }
                  }}
                  onClick={() => deleteToken(token)}
                >
                  Revoke
                </MenuItem>
              </SimpleMenu>
            </Typography>
            <Typography use="body2" tag="dd">
              <Tooltip content="Click to copy the token to clipboard">
                <input
                  aria-label="Token, press Enter to copy"
                  className={styles.token}
                  readOnly
                  value={token}
                  onClick={() => writeText(token)}
                  onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      writeText(token);
                    }
                  }}
                />
              </Tooltip>
            </Typography>
          </div>
        ))}
      </dl>
      <Button unelevated onClick={createToken}>
        Create new access token
      </Button>
    </Accordion>
  );
};
