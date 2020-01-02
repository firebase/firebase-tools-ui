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

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from './configureStore';
import { fetchRequest as fetchConfigRequest } from './store/config';

import App from './App';
import './index.scss';
import '@rmwc/tooltip/tooltip.css';

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
  <Provider store={store}>
    <RouterWithInit />
  </Provider>,
  document.getElementById('root')
);
