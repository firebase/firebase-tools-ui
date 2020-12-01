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
import { Elevation } from '@rmwc/elevation';
import { GridCell } from '@rmwc/grid';
import { Tab, TabBar } from '@rmwc/tabs';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link, matchPath, useHistory, useLocation } from 'react-router-dom';
import { useFirestore } from 'reactfire';

import { Route, routes } from '../../routes';
import { createStructuredSelector } from '../../store';
import {
  getFirestoreConfigResult,
  getProjectIdResult,
} from '../../store/config/selectors';
import { combineData, handle } from '../../store/utils';
import { CustomThemeProvider } from '../../themes';
import { EmulatorDisabled } from '../common/EmulatorDisabled';
import { InteractiveBreadCrumbBar } from '../common/InteractiveBreadCrumbBar';
import { Spinner } from '../common/Spinner';
import { promptClearAll } from './dialogs/clearAll';
import { Root } from './Document';
import {
  FirestoreEmulatedApiProvider,
  useEjector,
} from './FirestoreEmulatedApiProvider';
import PanelHeader from './PanelHeader';
import RulesTable from './Rules/RulesTable';
import { FirestoreStore } from './store';

interface WindowWithFirestoreDb extends Window {
  firestore?: firebase.firestore.Firestore;
}

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
    onNone: () => <Spinner span={12} message="Firestore Emulator Loading..." />,
    onError: () => <FirestoreRouteDisabled />,
    onData: ([projectId, config]) =>
      config === undefined ? (
        <FirestoreRouteDisabled />
      ) : (
        <FirestoreEmulatedApiProvider>
          <Firestore />
        </FirestoreEmulatedApiProvider>
      ),
  });
};

export default connect(mapStateToProps)(FirestoreRoute);

export const Firestore: React.FC = React.memo(() => {
  const firestore = useFirestore();
  const location = useLocation();
  const history = useHistory();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const eject = useEjector();

  // TODO: do something better here!
  const path = location.pathname.replace(/^\/firestore\/data/, '');
  const showCollectionShell = path.split('/').length < 2;
  const showDocumentShell = path.split('/').length < 3;

  const subNavRoutes = routes.filter(r => r.showInFirestoreSubNav);

  const subTabs = subNavRoutes.map(({ path, label }: Route) => (
    <Tab
      key={label}
      className="mdc-tab--min-width"
      {...{ tag: Link, to: path }}
    >
      {label}
    </Tab>
  ));

  const activeTabIndex = subNavRoutes.findIndex(r =>
    matchPath(location.pathname, {
      path: r.path,
      exact: r.exact,
    })
  );

  useEffect(() => {
    (window as WindowWithFirestoreDb).firestore = firestore;
    return () => ((window as WindowWithFirestoreDb).firestore = undefined);
  }, [firestore]);

  async function handleClearData() {
    const shouldNuke = await promptClearAll();
    if (!shouldNuke) return;
    setIsRefreshing(true);
    await eject();
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

  function renderClearDataAction() {
    return activeTabIndex !== 0 ? null : (
      <CustomThemeProvider use="warning" wrap>
        <Button unelevated onClick={() => handleClearData()}>
          Clear all data
        </Button>
      </CustomThemeProvider>
    );
  }

  function renderFirestoreData() {
    return activeTabIndex !== 0 ? null : (
      <Elevation z="2" wrap>
        <Card className="Firestore-panels-wrapper">
          <InteractiveBreadCrumbBar
            base="/firestore"
            path={path}
            onNavigate={handleNavigate}
          />
          <div className="Firestore-panels">
            <Root />
            {showCollectionShell && (
              <div
                className="Firestore-Collection"
                data-testid="collection-shell"
              >
                <PanelHeader id="" icon={null} />
              </div>
            )}
            {showDocumentShell && (
              <div className="Firestore-Document" data-testid="document-shell">
                <PanelHeader id="" icon={null} />
              </div>
            )}
          </div>
        </Card>
      </Elevation>
    );
  }

  function renderFirestoreRules() {
    return activeTabIndex !== 1 ? null : (
      <Elevation z="2" wrap>
        <Card className="Firestore-panels-wrapper">
          <RulesTable />
        </Card>
      </Elevation>
    );
  }

  return isRefreshing ? (
    <Spinner span={12} data-testid="firestore-loading" />
  ) : (
    <FirestoreStore>
      <GridCell span={12} className="Firestore">
        <div className="Firestore-actions">
          <TabBar
            className="Firestore-sub-tab-bar"
            theme="onSurface"
            activeTabIndex={activeTabIndex}
          >
            {subTabs}
          </TabBar>
          {renderClearDataAction()}
        </div>

        {renderFirestoreData()}
        {renderFirestoreRules()}
      </GridCell>
    </FirestoreStore>
  );
});

export const FirestoreRouteDisabled: React.FC = () => (
  <EmulatorDisabled productName="Firestore" />
);
