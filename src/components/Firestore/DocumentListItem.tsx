/**
 * Copyright 2019 Google LLC
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

import {
  ListItem,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemText,
} from '@rmwc/list';
import { Theme } from '@rmwc/theme';
import classNames from 'classnames';
import React from 'react';
import { NavLink } from 'react-router-dom';

import styles from './DocumentListItem.module.scss';
import { FirestoreAny } from './models';
import { summarize } from './utils';

const DocumentListItem: React.FC<{
  docId: string;
  url: string;
  queryFieldValue: FirestoreAny | undefined;
  missing?: boolean;
}> = ({ docId, url, queryFieldValue, missing }) => {
  const maxSummaryLen = 20;

  const listItemClass = classNames('Firestore-List-Item', {
    [styles.missing]: missing,
  });

  return (
    <Theme
      use={[missing ? 'textSecondaryOnBackground' : 'textPrimaryOnBackground']}
    >
      <ListItem
        className={listItemClass}
        tag={NavLink}
        to={`${url}/${encodeURIComponent(docId)}`}
        activeClassName="mdc-list-item--activated"
        data-testid="firestore-document-list-item"
      >
        {queryFieldValue === undefined ? (
          <ListItemText>{docId}</ListItemText>
        ) : (
          <ListItemText data-testid="twoLine">
            <ListItemPrimaryText>
              {summarize(queryFieldValue, maxSummaryLen)}
            </ListItemPrimaryText>
            <ListItemSecondaryText>{docId}</ListItemSecondaryText>
          </ListItemText>
        )}
      </ListItem>
    </Theme>
  );
};

export default DocumentListItem;
