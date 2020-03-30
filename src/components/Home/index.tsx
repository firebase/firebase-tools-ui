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

import { Card, CardActionButton, CardActionIcons } from '@rmwc/card';
import { GridCell, GridInner } from '@rmwc/grid';
import { ListDivider } from '@rmwc/list';
import { Typography } from '@rmwc/typography';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { createStructuredSelector } from '../../store';
import { getConfig } from '../../store/config/selectors';
import { ErrorInfo, squash } from '../../store/utils';

export const mapStateToProps = createStructuredSelector({
  configRemote: getConfig,
});

export type PropsFromState = ReturnType<typeof mapStateToProps>;
export type Props = PropsFromState;

export const Home: React.FC<Props> = ({ configRemote }) => {
  return (
    <GridCell span={12} className="Home">
      {squash(configRemote, {
        onNone: () => <HomeLoading />,
        onError: error => <HomeError error={error} />,
        onData: config => {
          return (
            <GridInner>
              <GridCell span={12}>
                <Typography use="headline5">Emulator Overview</Typography>
              </GridCell>
              {config.database && (
                <EmulatorCard
                  name="RTDB Emulator"
                  port={config.database.port}
                  linkTo="/database"
                />
              )}
              {config.firestore && (
                <EmulatorCard
                  name="Firestore Emulator"
                  port={config.firestore.port}
                  linkTo="/firestore"
                />
              )}
            </GridInner>
          );
        },
      })}
    </GridCell>
  );
};

export default connect(mapStateToProps)(Home);

// TODO
export const HomeLoading: React.FC = () => <p>Fetching Config...</p>;

// Show no content on error since we have a general disconnected overlay anyway.
export const HomeError: React.FC<{ error: ErrorInfo }> = ({ error }) => null;

export const EmulatorCard: React.FC<{
  name: string;
  port: number;
  linkTo: string;
}> = ({ name, port, linkTo }) => (
  <GridCell span={4}>
    <Card className="Home-EmulatorCard">
      <div className="Home-EmulatorCard-Info">
        <Typography use="headline6" tag="h3">
          {name}
        </Typography>
        <Typography use="subtitle2" tag="h4">
          Status
        </Typography>
        <Typography use="headline6" tag="div">
          On
        </Typography>
        <Typography use="subtitle2" tag="h4">
          Port number
        </Typography>
        <Typography use="headline6" tag="div">
          {port}
        </Typography>
      </div>
      <ListDivider />
      <CardActionIcons className="Home-EmulatorCard-Action">
        <CardActionButton tag={props => <Link to={linkTo} {...props} />}>
          Go to Emulator
        </CardActionButton>
      </CardActionIcons>
    </Card>
  </GridCell>
);
