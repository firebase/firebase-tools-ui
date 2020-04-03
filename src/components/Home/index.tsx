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

import './index.scss';

import {
  Card,
  CardActionButton,
  CardActionIcons,
  CardActions,
} from '@rmwc/card';
import { GridCell, GridRow } from '@rmwc/grid';
import { ListDivider } from '@rmwc/list';
import { Typography } from '@rmwc/typography';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { createStructuredSelector } from '../../store';
import { Config, EmulatorConfig } from '../../store/config';
import { getConfig } from '../../store/config/selectors';
import { squash } from '../../store/utils';
import { DatabaseIcon, FirestoreIcon, FunctionsIcon } from '../common/icons';
import { Spinner } from '../common/Spinner';
import { LocalWarningCallout } from './LocalWarningCallout';

export const mapStateToProps = createStructuredSelector({
  configRemote: getConfig,
});

export type PropsFromState = ReturnType<typeof mapStateToProps>;
export type Props = PropsFromState;

export const Home: React.FC<Props> = ({ configRemote }) =>
  squash(configRemote, {
    onNone: () => <Spinner span={12} message="Overview Page Loading..." />,
    onData: config => <Overview config={config} />,
    // Show all emulators as "off" on error.
    onError: () => <Overview config={{}} />,
  });

export default connect(mapStateToProps)(Home);

const Overview: React.FC<{
  config: Partial<Config>;
}> = ({ config }) => {
  return (
    <GridCell span={12}>
      <GridRow>
        {config.projectId && (
          <LocalWarningCallout projectId={config.projectId} />
        )}
        <GridCell span={12}>
          <Typography use="headline5">Emulator Overview</Typography>
        </GridCell>
        <EmulatorCard
          name="RTDB Emulator"
          icon={<DatabaseIcon theme="secondary" />}
          config={config.database}
          linkTo="/database"
          testId="emulator-info-database"
        />
        <EmulatorCard
          name="Firestore Emulator"
          icon={<FirestoreIcon theme="secondary" />}
          config={config.firestore}
          linkTo="/firestore"
          testId="emulator-info-firestore"
        />
        <EmulatorCard
          name="Functions Emulator"
          icon={<FunctionsIcon theme="secondary" />}
          config={config.functions}
          linkTo="/logs"
          linkLabel="View Logs"
          testId="emulator-info-functions"
        />
      </GridRow>
    </GridCell>
  );
};

export const EmulatorCard: React.FC<{
  name: string;
  icon: React.ReactElement;
  config: EmulatorConfig | undefined;
  linkTo: string;
  linkLabel?: string;
  testId?: string;
}> = ({ name, icon, config, linkTo, linkLabel, testId }) => (
  <GridCell span={4}>
    <Card className="Home-EmulatorCard" data-testid={testId}>
      <div className="Home-EmulatorCard-Info">
        <Typography use="headline6" tag="h3" className="title">
          {icon} {name}
        </Typography>
        <Typography use="body2" tag="h4" theme="secondary">
          Status
        </Typography>
        <Typography use="headline6" tag="div">
          {config ? 'On' : 'Off'}
        </Typography>
        <Typography use="body2" tag="h4" theme="secondary">
          Port number
        </Typography>
        <Typography use="headline6" tag="div">
          {config ? config.port : 'N/A'}
        </Typography>
      </div>
      <ListDivider />
      <CardActions>
        <CardActionIcons>
          <CardActionButton tag={Link} to={linkTo}>
            {linkLabel || 'Go to Emulator'}
          </CardActionButton>
        </CardActionIcons>
      </CardActions>
    </Card>
  </GridCell>
);
