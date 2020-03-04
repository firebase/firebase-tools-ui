/**
 * Copyright 2019 Google LLC
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

import React, { useState, useEffect } from 'react';
import './index.scss';
import 'firebase/firestore';
import { connect } from 'react-redux';
import { AppState } from '../../store';
import { FirestoreConfig } from '../../store/config';
import DatabaseApi from './api';
import { ApiProvider } from './ApiContext';
import Document from './Document';

export interface PropsFromState {
  config?: FirestoreConfig;
  projectId?: string;
}

export type Props = PropsFromState;

export const Firestore: React.FC<Props> = ({ config, projectId }) => {
  const [api, setApi] = useState<DatabaseApi | undefined>(undefined);
  const databaseId = '(default)';

  useEffect(() => {
    if (!config || !projectId) return;

    const api = new DatabaseApi(projectId, databaseId, config);
    setApi(api);

    return function cleanup() {
      api.delete();
    };
  }, [projectId, config, setApi]);

  if (!api) {
    return <p>Connecting to Firestore...</p>;
  }

  return (
    <ApiProvider value={api}>
      <div className="Firestore">
        <Document />
      </div>
    </ApiProvider>
  );
};

export const mapStateToProps = ({ config }: AppState) => ({
  config: config.config && config.config.firestore,
  projectId: config.config && config.config.projectId,
});

export default connect(mapStateToProps)(Firestore);
