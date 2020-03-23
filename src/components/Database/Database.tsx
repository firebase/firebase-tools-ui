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

import './Database.scss';
import './DataViewer/index.scss';

import { IconButton } from '@rmwc/icon-button';
import { ListDivider } from '@rmwc/list';
import { MenuItem, SimpleMenu } from '@rmwc/menu';
import * as firebase from 'firebase/app';
import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { initDatabase } from '../../firebase';
import { AppState } from '../../store';
import { DatabaseConfig } from '../../store/config';
import { InteractiveBreadCrumbBar } from '../common/InteractiveBreadCrumbBar';
import { NodeContainer } from './DataViewer/NodeContainer';

export interface PropsFromState {
  namespace: string;
  config?: DatabaseConfig;
}

export type Props = PropsFromState;

const getPrefix = (ref: firebase.database.Reference) => {
  const base = ref.root.toString();
  return base.substring(0, base.length - 1);
};

export const Database: React.FC<Props> = ({ config, namespace }) => {
  const [ref, setRef] = useState<firebase.database.Reference | undefined>(
    undefined
  );
  const history = useHistory();

  useEffect(() => {
    if (!config) return;
    const [db, { cleanup }] = initDatabase(config, namespace);
    setRef(db.ref());
    return cleanup;
  }, [config, namespace, setRef]);

  // TODO: remove once route path is wired up (in another PR)
  const doNavigate = useCallback(
    (path: string) => setRef(ref && ref.root.child(path)),
    [setRef, ref]
  );

  const urlBase = `/database/${namespace}/data`;
  const handleNavigate = (path: string) => {
    history.push(`${urlBase}/${path}`);
  };

  return (
    <div className="Database-Database">
      {ref ? (
        <>
          <InteractiveBreadCrumbBar
            base={urlBase}
            path={new URL(ref.toString()).pathname}
            inputPrefix={getPrefix(ref)}
            onNavigate={handleNavigate}
          >
            <SimpleMenu handle={<IconButton icon="more_vert" />}>
              <MenuItem disabled>Export JSON</MenuItem>
              <MenuItem disabled>Import JSON</MenuItem>
              <ListDivider />
              <MenuItem disabled>Create new database</MenuItem>
            </SimpleMenu>
          </InteractiveBreadCrumbBar>
          <NodeContainer realtimeRef={ref} isViewRoot onNavigate={doNavigate} />
        </>
      ) : (
        <p>Loading</p>
      )}
    </div>
  );
};

export const mapStateToProps = ({ config }: AppState) => ({
  config: config.config ? config.config.database : undefined,
});

export default connect(mapStateToProps)(Database);
