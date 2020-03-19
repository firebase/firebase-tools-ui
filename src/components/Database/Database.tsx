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

import * as firebase from 'firebase/app';
import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { initDatabase } from '../../firebase';
import { AppState } from '../../store';
import { DatabaseConfig } from '../../store/config';
import { BreadCrumbs } from '../common/BreadCrumbs';
import { CardActionBar } from '../common/CardActionBar';
import { NodeContainer } from './DataViewer/NodeContainer';

export interface PropsFromState {
  namespace: string;
  config?: DatabaseConfig;
}

export type Props = PropsFromState;

export const Database: React.FC<Props> = ({ config, namespace }) => {
  const [ref, setRef] = useState<firebase.database.Reference | undefined>(
    undefined
  );
  useEffect(() => {
    if (!config) return;
    const [db, { cleanup }] = initDatabase(config, namespace);
    setRef(db.ref());
    return cleanup;
  }, [config, namespace, setRef]);

  const doNavigate = useCallback(
    (path: string) => setRef(ref && ref.root.child(path)),
    [setRef, ref]
  );

  return (
    <div className="Database-Database">
      <CardActionBar>
        {ref && (
          <BreadCrumbs
            base={`/database/${namespace}/data`}
            path={new URL(ref.toString()).pathname}
          />
        )}
      </CardActionBar>
      {ref ? (
        <>
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
