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
import {
  AuthIcon,
  DatabaseIcon,
  FirestoreIcon,
  FunctionsIcon,
  HostingIcon,
  PubSubIcon,
} from '../common/icons';
import { Spinner } from '../common/Spinner';
import { LocalWarningCallout } from './LocalWarningCallout';
import { StatusLabel } from './StatusLabel';

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
          <Typography use="headline5">Emulator overview</Typography>
        </GridCell>
        <EmulatorCard
          name="Authentication emulator"
          icon={<AuthIcon theme="secondary" />}
          config={config.auth}
          linkTo="/auth"
          testId="emulator-info-auth"
        />
        <EmulatorCard
          name="Firestore emulator"
          icon={<FirestoreIcon theme="secondary" />}
          config={config.firestore}
          linkTo="/firestore"
          testId="emulator-info-firestore"
        />
        <EmulatorCard
          name="Realtime Database emulator"
          icon={<DatabaseIcon theme="secondary" />}
          config={config.database}
          linkTo="/database"
          testId="emulator-info-database"
        />
        <EmulatorCard
          name="Functions emulator"
          icon={<FunctionsIcon theme="secondary" />}
          config={config.functions}
          linkTo="/functions"
          linkLabel="View logs"
          testId="emulator-info-functions"
        />
        <EmulatorCard
          name="Hosting emulator"
          icon={<HostingIcon theme="secondary" />}
          config={config.hosting}
          testId="emulator-info-hosting"
          linkToExternal={
            config.hosting && `http://${config.hosting.hostAndPort}/`
          }
          linkLabel="View website"
        />
        <EmulatorCard
          name="PubSub emulator"
          icon={<PubSubIcon theme="secondary" />}
          config={config.pubsub}
          testId="emulator-info-pubsub"
        />
      </GridRow>
    </GridCell>
  );
};

export const EmulatorCard: React.FC<{
  name: string;
  icon: React.ReactElement;
  config: EmulatorConfig | undefined;
  linkTo?: string;
  linkToExternal?: string;
  linkLabel?: string;
  testId?: string;
}> = ({ name, icon, config, linkTo, linkLabel, linkToExternal, testId }) => (
  <GridCell span={4}>
    <Card className="Home-EmulatorCard" data-testid={testId}>
      <div className="Home-EmulatorCard-Info">
        <Typography use="headline6" tag="h3" className="title">
          {icon} <span>{name}</span>
        </Typography>
        <Typography use="body2" tag="h4" theme="secondary">
          Status
        </Typography>
        <StatusLabel isActive={!!config} />
        <Typography use="body2" tag="h4" theme="secondary">
          Port number
        </Typography>
        <Typography use="headline6" tag="div">
          {config ? config.port : 'N/A'}
        </Typography>
      </div>
      {(linkToExternal || linkTo) && <ListDivider tag="div" />}
      <CardActions>
        <CardActionIcons>
          {linkToExternal && (
            <CardActionButton tag="a" href={linkToExternal} target="_blank">
              {linkLabel}
            </CardActionButton>
          )}
          {linkTo && (
            <CardActionButton tag={Link} to={linkTo}>
              {linkLabel || 'Go to emulator'}
            </CardActionButton>
          )}
        </CardActionIcons>
      </CardActions>
    </Card>
  </GridCell>
);
