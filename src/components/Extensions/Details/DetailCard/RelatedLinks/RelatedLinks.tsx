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

import { Extension } from '../../../models';
import style from './RelatedLinks.module.scss';

export interface RelatedLinksProps {
  extension: Extension;
}

export const RelatedLinks: React.FC<RelatedLinksProps> = ({ extension }) => {
  return (
    <Theme use="secondary">
      <ul className={style.links}>
        <li>
          <Icon icon="person" />

          <Typography use="body2" theme="secondary">
            Made by{' '}
            <a
              href={extension.authorUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {extension.authorName}
            </a>
          </Typography>
        </li>
        <li>
          <Icon icon="newsmode" />
          <Typography use="body2" theme="secondary">
            <a href={extension.extensionDetailsUrl}>Extension details</a>
          </Typography>
        </li>
        <li>
          <Icon icon="developer_mode_tv" />
          <Typography use="body2" theme="secondary">
            <a
              href={extension.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Source code
            </a>
          </Typography>
        </li>
        <li>
          <Icon icon="subject" />
          <Typography use="body2" theme="secondary">
            <a
              href="https://firebase.google.com/docs/extensions"
              target="_blank"
              rel="noopener noreferrer"
            >
              Firebase extension docs
            </a>
          </Typography>
        </li>
      </ul>
    </Theme>
  );
};
