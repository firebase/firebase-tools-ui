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

import React from 'react';
import { Route, match } from 'react-router-dom';
import './App.scss';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Database from './components/Database';
import DatabaseDefaultRoute from './components/Database/DatabaseDefaultRoute';

const DatabaseRoute: React.FC<{ match: match<{ namespace: string }> }> = ({
  match,
}) => <Database namespace={match.params.namespace} />;

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Firebase Emulator Suite</h1>
        <Navigation />
      </header>
      <div className="App-main">
        <Route exact path="/" component={Home} />
        <Route exact path="/database" component={DatabaseDefaultRoute} />
        <Route path="/database/:namespace/data" component={DatabaseRoute} />
      </div>
    </div>
  );
};

export default App;
