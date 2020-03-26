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

import { AppState } from '../../store';
import { ConfigState } from '../../store/config';

export interface PropsFromState {
  config: ConfigState;
}

export type Props = PropsFromState;

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

export const Home: React.FC<Props> = ({ config }) => {
  return (
    <GridCell span={12} className="Home">
      {config.fetching ? (
        <p>Fetching Config...</p>
      ) : config.error ? (
        <p className="Home-error">{config.error.message}</p>
      ) : (
        config.config && (
          <GridInner>
            <GridCell span={12}>
              <Typography use="headline5">Emulator Overview</Typography>
            </GridCell>
            {config.config.database && (
              <EmulatorCard
                name="RTDB Emulator"
                port={config.config.database.port}
                linkTo="/database"
              />
            )}
            {config.config.firestore && (
              <EmulatorCard
                name="Firestore Emulator"
                port={config.config.firestore.port}
                linkTo="/firestore/data"
              />
            )}
          </GridInner>
        )
      )}
    </GridCell>
  );
};

export const mapStateToProps = ({ config }: AppState) => ({ config });

export default connect(mapStateToProps)(Home);
