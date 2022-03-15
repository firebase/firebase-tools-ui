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

import { randomId } from '@rmwc/base';
import { List, ListItem } from '@rmwc/list';
import { Typography } from '@rmwc/typography';
import React, { useState } from 'react';

import style from './useMasterDetail.module.scss';

export interface MasterDetailTabConfig {
  label: string;
  tab: JSX.Element;
}

export interface MasterDetailConfig {
  tabs: MasterDetailTabConfig[];
}

export function useMasterDetail(config: MasterDetailConfig) {
  const [idPrefix] = useState(randomId('master-detail'));
  const [index, setIndex] = useState(0);

  const tabs = (
    <List role="tablist" className={style.masterDetailWrapper}>
      {config.tabs.map((tab, i) => (
        <ListItem
          className={style.listItem}
          role="tab"
          key={i}
          id={idPrefix + i}
          aria-selected={index === i}
          activated={index === i}
          onClick={() => setIndex(i)}
          onKeyDown={(e) => {
            // List already has keyboard navigation, we just need to handle Enter/Space.
            if (e.key === 'Enter' || e.key === ' ') {
              setIndex(i);
            }
          }}
        >
          <Typography use="body2">{tab.label}</Typography>
        </ListItem>
      ))}
    </List>
  );

  const content = (
    <div>
      {config.tabs.map((tab, i) => (
        <div
          role="tabpanel"
          style={{ display: i === index ? 'block' : 'none' }}
          key={i}
          aria-labelledby={idPrefix + i}
        >
          {tab.tab}
        </div>
      ))}
    </div>
  );

  return { tabs, content };
}
