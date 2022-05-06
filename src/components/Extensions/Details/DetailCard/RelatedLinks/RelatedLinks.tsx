/**
 * Copyright 2020 Google LLC
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
import { Typography } from '@rmwc/typography';
import React from 'react';

import { DocsLink } from '../../../../common/links/DocsLink';
import { ExternalLink } from '../../../../common/links/ExternalLink';
import { useExtension } from '../../../api/useExtension';
import styles from './RelatedLinks.module.scss';

export const RelatedLinks: React.FC = () => {
  const extension = useExtension()!;

  return (
    <Theme use="secondary">
      <ul className={styles.links}>
        <li>
          <Icon icon="person" className={styles.pic} />

          <Typography use="body2" theme="secondary">
            Made by{' '}
            {extension.authorUrl ? (
              <ExternalLink href={extension.authorUrl}>
                {extension.authorName}
              </ExternalLink>
            ) : (
              extension.authorName
            )}
          </Typography>
        </li>
        {extension.extensionDetailsUrl && (
          <li>
            <Icon icon="newsmode" className={styles.pic} />
            <Typography use="body2" theme="secondary">
              <ExternalLink href={extension.extensionDetailsUrl}>
                Extension details
              </ExternalLink>
            </Typography>
          </li>
        )}
        <li>
          <Icon icon="developer_mode_tv" className={styles.pic} />
          <Typography use="body2" theme="secondary">
            <ExternalLink href={extension.sourceUrl}>Source code</ExternalLink>
          </Typography>
        </li>
        <li>
          <Icon icon="subject" className={styles.pic} />
          <Typography use="body2" theme="secondary">
            <DocsLink href="extensions"> Firebase extension docs</DocsLink>
          </Typography>
        </li>
      </ul>
    </Theme>
  );
};
