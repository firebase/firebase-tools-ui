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
import { firestore } from 'firebase';
import './index.scss';
import { Button } from '@rmwc/button';
import { Card } from '@rmwc/card';
import { DialogButton } from '@rmwc/dialog';
import { Theme } from '@rmwc/theme';
import { connect } from 'react-redux';
import { AppState } from '../../store';
import { FirestoreConfig } from '../../store/config';
import DatabaseApi from './api';
import { ApiProvider } from './ApiContext';
import { Root } from './Document';
import { confirm } from '../DialogQueue';

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

    (window as any).db = api.database;
    (window as any).firestore = firestore;

    api.database
      .collection('people')
      .doc('john_doe')
      .set({
        first_name: 'john',
        last_name: 'doe',
        age: 42,
        isAlive: true,
        address: {
          street: {
            number: 84,
            name: 'westminster rd',
          },
          city: 'chatham',
          geo: new firestore.GeoPoint(4, 2),
        },
        aliases: [
          'tj',
          'papy',
          'lambchops',
          { hmm: 'ok', subList: ['entry1'] },
        ],
      });

    return function cleanup() {
      api.delete();
    };
  }, [projectId, config, setApi]);

  if (!api) {
    return <p>Connecting to Firestore...</p>;
  }

  async function handleClearData(api: DatabaseApi) {
    const shouldNuke = await confirm({
      title: 'Delete all data?',
      body: `Proceeding will delete all your collections, sub-collections and
             documents within your database.`,
      // hide standard buttons so as to use `danger` button
      acceptLabel: null,
      cancelLabel: null,
      footer: (
        <>
          <Theme use={['textSecondaryOnBackground']} wrap>
            <DialogButton action="close">Cancel</DialogButton>
          </Theme>
          <DialogButton action="accept" isDefaultAction danger>
            Clear
          </DialogButton>
        </>
      ),
    });
    if (!shouldNuke) return;
    api.nukeDocuments();
  }

  return (
    <ApiProvider value={api}>
      <div className="Firestore">
        <div className="Firestore-actions">
          <Button danger unelevated onClick={() => handleClearData(api)}>
            clear all data
          </Button>
        </div>
        <Card className="Firestore-panels">
          <Root />
        </Card>
      </div>
    </ApiProvider>
  );
};

export const mapStateToProps = ({ config }: AppState) => ({
  config: config.config && config.config.firestore,
  projectId: config.config && config.config.projectId,
});

export default connect(mapStateToProps)(Firestore);
