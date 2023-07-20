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
import { Select } from '@rmwc/select';
import { Tab, TabBar } from '@rmwc/tabs';
import React, { Suspense, useState } from 'react';
import {
  Link,
  Redirect,
  Route,
  Switch,
  matchPath,
  useHistory,
  useLocation,
} from 'react-router-dom';

import * as actions from './store/actions';
import { CustomThemeProvider } from '../../themes';
import { useIsEmulatorDisabled } from '../common/EmulatorConfigProvider';
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
import FirestoreRequests from './Requests';
import { FirestoreStore, useDispatch } from './store';

var currentSelectedDatabaseId : string;
var setCurrentSelectedDatabaseId : (newDatabaseId: string) => void;

export const FirestoreRoute: React.FC<
  React.PropsWithChildren<unknown>
> = () => {

  [currentSelectedDatabaseId, setCurrentSelectedDatabaseId] = useState("(default)");
console.log("DB ID is now: " + currentSelectedDatabaseId);
  return (
    <Suspense fallback={<FirestoreRouteSuspended />}>
      <FirestoreEmulatedApiProvider currentSelectedDatabaseId={currentSelectedDatabaseId}>
        <Firestore databaseId={currentSelectedDatabaseId} />
      </FirestoreEmulatedApiProvider>
    </Suspense>
  );
};

export default FirestoreRoute;

interface FirestoreTabRoute {
  path: string;
  label: string;
  exact: boolean;
}
const firestoreRoutes: ReadonlyArray<FirestoreTabRoute> = [
  {
    path: '/firestore/data',
    label: 'Data',
    exact: false,
  },
  {
    path: '/firestore/requests',
    label: 'Requests',
    exact: false,
  },
];
// FIXME I pass this databseId in only to rerender when it changes. yucky .....
export const Firestore: React.FC<React.PropsWithChildren<{databaseId: string}>> = React.memo(
  () => {
    const location = useLocation();
    const history = useHistory();
    const [isRefreshing, setIsRefreshing] = useState(false); // FIXME refreshing animation?
    const eject = useEjector();

    // TODO: do something better here!
    const path = location.pathname.replace(/^\/firestore\/data/, '');
    const showCollectionShell = path.split('/').length < 2;
    const showDocumentShell = path.split('/').length < 3;

    const subTabs = firestoreRoutes.map(
      ({ path, label }: FirestoreTabRoute) => (
        <Tab
          key={label}
          className="mdc-tab--min-width"
          {...{ tag: Link, to: path }}
        >
          {label}
        </Tab>
      )
    );
    const activeTabIndex = firestoreRoutes.findIndex((r) =>
      matchPath(location.pathname, {
        path: r.path,
        exact: r.exact,
      })
    );

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
      const root = '/firestore/data';
      if (path === undefined) {
        history.push(root);
      } else {
        history.push(`${root}/${path}`);
      }
    }

    return isRefreshing ? (
      <Spinner span={12} data-testid="firestore-loading" />
    ) : (
      <FirestoreStore>
        <GridCell span={2}>
         <DatabaseIdDropdown/>
        </GridCell>
        <GridCell span={12} className="Firestore">
          <div className="Firestore-sub-tabs">
            <TabBar theme="onSurface" activeTabIndex={activeTabIndex}>
              {subTabs}
            </TabBar>
          </div>

          <Switch>
            <Route path="/firestore/data">
              <FirestoreDataCard
                path={path}
                handleClearData={handleClearData}
                handleNavigate={handleNavigate}
                showCollectionShell={showCollectionShell}
                showDocumentShell={showDocumentShell}
              />
            </Route>
            <Route path="/firestore/requests">
              <FirestoreRequestsCard />
            </Route>
            <Redirect from="/firestore" to="/firestore/data" />
          </Switch>
        </GridCell>
      </FirestoreStore>
    );
  }
);
// FIXME should I convert this to a component?
const DatabaseIdDropdown = () => {
  const options = [
    // FIXME need some wrapping here if the length is too long. What is the max length of a DB ID?
    { label: '(Default)', value: '1' },
    { label: 'gggg', value: '2' },
    { label: 'Create a database<a href="google.com">fff</a>', value: '3' },
  ];
  const dispatch = useDispatch()

  return (
    <Select
      label="Select a database"
      defaultValue="1"
      options={options}
      outlined
      onChange={(e: any) => {
        if (e.target.value === "2") {
          dispatch(
            actions.setSelectedDatabaseId({
              databaseId: "gggg"
            })
          );
          setCurrentSelectedDatabaseId('gggg');
        } else {
          dispatch(
            actions.setSelectedDatabaseId({
              databaseId: "(default)"
            })
          );
          setCurrentSelectedDatabaseId('(default)');
        }
      }}
    />
  );
};

interface FirestoreDataCardProps {
  path: string;
  handleClearData: () => void;
  handleNavigate: (path?: string) => void;
  showCollectionShell: boolean;
  showDocumentShell: boolean;
}

const FirestoreDataCard: React.FC<
  React.PropsWithChildren<FirestoreDataCardProps>
> = ({
  path,
  handleClearData,
  handleNavigate,
  showCollectionShell,
  showDocumentShell,
}) => (
  <>
    <div className="Firestore-actions">
      <CustomThemeProvider use="warning" wrap>
        <Button unelevated onClick={() => handleClearData()}>
          Clear all data
        </Button>
      </CustomThemeProvider>
    </div>
    <Elevation z="2" wrap>
      <Card className="Firestore-panels-wrapper">
        <InteractiveBreadCrumbBar
          base="/firestore/data"
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
  </>
);

const FirestoreRequestsCard: React.FC<
  React.PropsWithChildren<unknown>
> = () => (
  <Elevation z="2" wrap>
    <Card className="Firestore-panels-wrapper">
      <FirestoreRequests />
    </Card>
  </Elevation>
);

const FirestoreRouteSuspended: React.FC<
  React.PropsWithChildren<unknown>
> = () => {
  const isDisabled = useIsEmulatorDisabled('firestore');
  return isDisabled ? (
    <EmulatorDisabled productName="Firestore" />
  ) : (
    <Spinner span={12} message="Firestore Emulator Loading..." />
  );
};
