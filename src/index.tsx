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

import { background, primary, secondary } from './colors';
import App from './components/App';
import configureStore from './configureStore';
import { subscribe as subscribeToConfig } from './store/config';
import { error } from './themes';

const store = configureStore();

const RouterWithInit = () => {
  useEffect(() => {
    store.dispatch(subscribeToConfig());
  }, []); // Empty-array means "run only once on init": https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects
  return (
    <BrowserRouter>
      <Switch>
        <Route component={App} />
      </Switch>
    </BrowserRouter>
  );
};

ReactDOM.unstable_createBlockingRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RMWCProvider
      // Globally disable ripples
      ripple={false}
    >
      <ThemeProvider
        options={{
          background,
          primary,
          primaryRgb: '104, 29, 168',
          secondary,
          error,
        }}
      >
        <Provider store={store}>
          <RouterWithInit />
        </Provider>
      </ThemeProvider>
    </RMWCProvider>
  </React.StrictMode>
);
