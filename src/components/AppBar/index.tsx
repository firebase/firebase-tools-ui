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

import { withRouter } from 'react-router-dom';
import React from 'react';
import { Link } from 'react-router-dom';
import { TabBar, Tab } from '@rmwc/tabs';
import { TopAppBar, TopAppBarRow, TopAppBarSection } from '@rmwc/top-app-bar';
import { Typography } from '@rmwc/typography';

import Logo from '../Logo';

import './index.scss';

// TODO(tlavelle): consolidate this with the router in App.tsx
const defaultLink = { to: '/', label: 'overview' };
const links = [
  { key: 'database', to: '/database', label: 'rtdb' },
  { key: 'spam', to: '/spam', label: 'other' },
];

export const AppBar: React.FC<any> = (props) => {
  const tabs = [defaultLink, ...links].map(({ to, label }) => (
    <Tab key={label} className="mdc-tab--min-width" {...{ tag: Link, to }}>
      {label}
    </Tab>
  ));

  const activeTab =
    links.findIndex((l) => props.history.location.pathname.startsWith(l.to)) +
      1 || 0;

  return (
    <>
      <TopAppBar fixed prominent className="AppBar">
        <TopAppBarRow>
          <TopAppBarSection>
            <div className="title-grid">
              <Logo />
              <Typography use="headline5" className="title">
                Firebase Emulator
              </Typography>
              <Typography use="subtitle1" className="subtitle">
                This is a local enviornment and not the Firebase console
              </Typography>
            </div>
          </TopAppBarSection>
        </TopAppBarRow>
        <TabBar activeTabIndex={activeTab}>{tabs}</TabBar>
      </TopAppBar>
    </>
  );
};

export default withRouter(AppBar);
