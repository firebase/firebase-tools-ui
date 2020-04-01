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

import './index.scss';

import { Button } from '@rmwc/button';
import { Card } from '@rmwc/card';
import { CircularProgress } from '@rmwc/circular-progress';
import { Elevation } from '@rmwc/elevation';
import { GridCell } from '@rmwc/grid';
import { Typography } from '@rmwc/typography';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { createStructuredSelector } from '../../store';
import { FirestoreConfig } from '../../store/config';
import {
  getFirestoreConfigResult,
  getProjectIdResult,
} from '../../store/config/selectors';
import { combineData, handle } from '../../store/utils';
import { CustomThemeProvider } from '../../themes';
import { EmulatorDisabled } from '../common/EmulatorDisabled';
import { InteractiveBreadCrumbBar } from '../common/InteractiveBreadCrumbBar';
import { Spinner } from '../common/Spinner';
import DatabaseApi from './api';
import { ApiProvider } from './ApiContext';
import { promptClearAll } from './dialogs/clearAll';
import { Root } from './Document';

export const mapStateToProps = createStructuredSelector({
  projectIdResult: getProjectIdResult,
  configResult: getFirestoreConfigResult,
});

export type PropsFromState = ReturnType<typeof mapStateToProps>;

export const FirestoreRoute: React.FC<PropsFromState> = ({
  projectIdResult,
  configResult,
}) => {
  return handle(combineData(projectIdResult, configResult), {
    onNone: () => (
      <Spinner span={12} message={'Firestore Emulator Loading...'} />
    ),
    onError: () => <FirestoreRouteDisabled />,
    onData: ([projectId, config]) =>
      config === undefined ? (
        <FirestoreRouteDisabled />
      ) : (
        <Firestore projectId={projectId} config={config} />
      ),
  });
};

export default connect(mapStateToProps)(FirestoreRoute);

export interface FirestoreProps {
  config: FirestoreConfig;
  projectId: string;
}

export const Firestore: React.FC<FirestoreProps> = ({ config, projectId }) => {
  const [api, setApi] = useState<DatabaseApi | undefined>(undefined);
  const databaseId = '(default)';
  const location = useLocation();
  const history = useHistory();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // TODO: do something better here!
  const path = location.pathname.replace(/^\/firestore/, '');

  useEffect(() => {
    const api = new DatabaseApi(projectId, databaseId, config);
    setApi(api);

    return function cleanup() {
      api.delete();
    };
  }, [projectId, config, setApi]);

  if (!api) {
    return null;
  }

  async function handleClearData(api: DatabaseApi) {
    const shouldNuke = await promptClearAll();
    if (!shouldNuke) return;
    setIsRefreshing(true);
    await api.nukeDocuments();
    handleNavigate();
    setIsRefreshing(false);
  }

  function handleNavigate(path?: string) {
    // TODO: move to routing constants
    const root = '/firestore';
    if (path === undefined) {
      history.push(root);
    } else {
      history.push(`${root}/${path}`);
    }
  }

  return isRefreshing ? (
    <Spinner span={12} />
  ) : (
    <ApiProvider value={api}>
      <GridCell span={12} className="Firestore">
        <div className="Firestore-actions">
          <CustomThemeProvider use="warning" wrap>
            <Button unelevated onClick={() => handleClearData(api)}>
              Clear all data
            </Button>
          </CustomThemeProvider>
        </div>
        <Elevation z="2" wrap>
          <Card className="Firestore-panels-wrapper">
            <InteractiveBreadCrumbBar
              base="/firestore"
              path={path}
              onNavigate={handleNavigate}
            />
            <div className="Firestore-panels">
              <Root />
            </div>
          </Card>
        </Elevation>
      </GridCell>
    </ApiProvider>
  );
};

export const FirestoreLoading: React.FC = () => (
  <GridCell
    span={12}
    className="Firestore-loading"
    data-testid="firestore-loading"
  >
    <CircularProgress size="xlarge" />
    <Typography use="body2" tag="p">
      Firestore Emulator Loading...
    </Typography>
  </GridCell>
);

export const FirestoreRouteDisabled: React.FC = () => (
  <EmulatorDisabled productName="Firestore" />
);
