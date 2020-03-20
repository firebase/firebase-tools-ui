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

import '@rmwc/tooltip/tooltip.css';

// General + library styling. Should come before all local imports to allow
// local styling to override them.
import './index.scss';

import { RMWCProvider } from '@rmwc/provider';
import { ThemeProvider } from '@rmwc/theme';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import App from './App';
import {
  background,
  caution,
  error,
  note,
  primary,
  secondary,
  success,
} from './colors';
import configureStore from './configureStore';
import { fetchRequest as fetchConfigRequest } from './store/config';

const store = configureStore();

const RouterWithInit = () => {
  useEffect(() => {
    store.dispatch(fetchConfigRequest());
  }, []); // Empty-array means "run only once on init": https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects
  return (
    <BrowserRouter>
      <Switch>
        <Route component={App} />
      </Switch>
    </BrowserRouter>
  );
};

ReactDOM.render(
  <RMWCProvider
    // Globally disable ripples
    ripple={false}
  >
    <ThemeProvider
      options={{
        background,
        primary,
        secondary,
        error,
        success,
        note,
        caution,
      }}
    >
      <Provider store={store}>
        <RouterWithInit />
      </Provider>
    </ThemeProvider>
  </RMWCProvider>,
  document.getElementById('root')
);
