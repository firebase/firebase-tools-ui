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
import { connect } from 'react-redux';
import { AppState } from '../../store';
import { ConfigState } from '../../store/config';
import './index.scss';

export interface PropsFromState {
  config: ConfigState;
}

export type Props = PropsFromState;

export const Home: React.FC<Props> = ({ config }) => {
  return (
    <div className="Home">
      {config.fetching ? (
        <p>Fetching Config...</p>
      ) : config.error ? (
        <p className="Home-error">{config.error.message}</p>
      ) : (
        config.config && (
          <div>
            <h1>Firebase Emulator Suite</h1>
            {config.config && (
              <h3>
                Project ID: <code>{config.config.projectId}</code>
              </h3>
            )}
            <ul>
              {config.config!.database && (
                <li>
                  Database Emulator running at:{' '}
                  <code>{config.config!.database.hostAndPort}</code>
                </li>
              )}
              {config.config!.firestore && (
                <li>
                  Firestore Emulator running at:{' '}
                  <code>{config.config!.firestore.hostAndPort}</code>
                </li>
              )}
            </ul>
          </div>
        )
      )}
    </div>
  );
};

export const mapStateToProps = ({ config }: AppState) => ({ config });

export default connect(mapStateToProps)(Home);
