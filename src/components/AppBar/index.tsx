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

import { useLocation, matchPath, Link } from 'react-router-dom';
import React from 'react';
import { TabBar, Tab } from '@rmwc/tabs';
import { TopAppBar, TopAppBarRow, TopAppBarSection } from '@rmwc/top-app-bar';
import { Typography } from '@rmwc/typography';
import { ThemeProvider } from '@rmwc/theme';

import Logo from '../Logo';
import { Route } from '../../routes';

import './index.scss';
import { navBarPrimary, navBarOnSurface } from '../../colors';

type Props = {
  routes: ReadonlyArray<Route>;
};

export const AppBar: React.FC<Props> = ({ routes }) => {
  let location = useLocation();

  const navRoutes = routes.filter(r => r.showInNav);

  const tabs = navRoutes.map(({ path, label }: Route) => (
    <Tab
      key={label}
      className="mdc-tab--min-width"
      {...{ tag: Link, to: path }}
    >
      {label}
    </Tab>
  ));

  const activeTabIndex = navRoutes.findIndex(r =>
    matchPath(location.pathname, {
      path: r.path,
      exact: r.exact,
    })
  );

  return (
    <ThemeProvider
      options={{
        primary: navBarPrimary,
        onSurface: navBarOnSurface,
      }}
    >
      <TopAppBar fixed prominent className="AppBar">
        <TopAppBarRow>
          <TopAppBarSection>
            <div className="title-grid">
              <Logo />
              <Typography use="headline5" className="title">
                Firebase Emulator Suite
              </Typography>
              <Typography use="subtitle1" className="subtitle">
                This is a local environment and not the Firebase console
              </Typography>
            </div>
          </TopAppBarSection>
        </TopAppBarRow>
        <TabBar activeTabIndex={activeTabIndex}>{tabs}</TabBar>
      </TopAppBar>
    </ThemeProvider>
  );
};

export default AppBar;
