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

import './AppBar.scss';

import { Tab, TabBar } from '@rmwc/tabs';
import { ThemeProvider } from '@rmwc/theme';
import { TopAppBar } from '@rmwc/top-app-bar';
import { Typography } from '@rmwc/typography';
import React from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';

import { navBarOnSurface, navBarPrimary, navBarSurface } from '../../colors';
import { Route } from '../../routes';
import Logo from '../common/Logo';

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
        surface: navBarSurface,
        onSurface: navBarOnSurface,
      }}
      wrap
    >
      <TopAppBar fixed className="AppBar" theme="surface">
        <div className="AppBar-title-row">
          <div className="AppBar-logo-lockup">
            <Logo />
            <Typography use="headline5" className="AppBar-title" tag="h1">
              Firebase Emulator Suite
            </Typography>
          </div>
        </div>
        <TabBar theme="onSurface" activeTabIndex={activeTabIndex}>
          {tabs}
        </TabBar>
      </TopAppBar>
    </ThemeProvider>
  );
};

export default AppBar;
