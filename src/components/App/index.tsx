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

import './index.scss';

import { DialogQueue } from '@rmwc/dialog';
import { Grid } from '@rmwc/grid';
import { Theme } from '@rmwc/theme';
import React from 'react';
import { Route } from 'react-router-dom';

import { routes } from '../../routes';
import { dialogs } from '../common/DialogQueue';
import AppBar from './AppBar';

const App: React.FC = () => {
  return (
    <>
      <DialogQueue dialogs={dialogs} />
      <Theme use="background" wrap>
        <div className="App">
          <AppBar routes={routes} />
          <Grid className="App-main">
            {routes.map(r => (
              <Route
                key={r.path}
                path={r.path}
                component={r.component}
                exact={r.exact}
              />
            ))}
          </Grid>
        </div>
      </Theme>
    </>
  );
};

export default App;
