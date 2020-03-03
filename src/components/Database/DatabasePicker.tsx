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

import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../store';
import {
  List,
  ListGroup,
  ListGroupSubheader,
  ListItem,
  ListItemGraphic,
  ListItemText,
  ListDivider,
} from '@rmwc/list';
import { Typography } from '@rmwc/typography';
import '@rmwc/icon/icon.css';
import './DatabasePicker.scss';

export interface PropsFromState {
  databases?: string[];
}

export type Props = PropsFromState & {
  primary: string;
  current: string;
  navigation: (db: string) => ReactElement;
};

const databaseIcon = (
  <svg
    width="38"
    height="38"
    viewBox="0 0 38 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19 37C28.9411 37 37 28.9411 37 19C37 9.05887 28.9411 1 19 1C9.05887 1 1 9.05887 1 19C1 28.9411 9.05887 37 19 37Z"
      fill="white"
      stroke="black"
      strokeOpacity="0.12"
    />
    <path
      className="database-icon-fill"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 22H28V26.002C28.0005 26.5315 27.7906 27.0396 27.4164 27.4143C27.0423 27.7891 26.5345 27.9997 26.005 28H11.995C10.8929 27.9978 10.0005 27.1041 10 26.002V22ZM10 11.992C10 10.892 10.893 10 11.995 10H26.005C27.107 10 28 10.9 28 11.992V19.008C28 20.108 27.107 21 26.005 21H11.995C10.893 21 10 20.1 10 19.008V11.992ZM12 12H26V15H12V12ZM12 17.505C12 17.225 12.214 17 12.505 17H13.495C13.775 17 14 17.214 14 17.505V18.495C14 18.775 13.786 19 13.495 19H12.505C12.3704 19.0022 12.2407 18.9497 12.1455 18.8545C12.0503 18.7593 11.9978 18.6296 12 18.495V17.505ZM12 24.505C12 24.225 12.214 24 12.505 24H13.495C13.775 24 14 24.214 14 24.505V25.495C14 25.775 13.786 26 13.495 26H12.505C12.3704 26.0022 12.2407 25.9497 12.1455 25.8545C12.0503 25.7593 11.9978 25.6296 12 25.495V24.505Z"
      fill="black"
    />
  </svg>
);

const DatabaseListItem: React.FC<{
  name: string;
  navigation: (db: string) => ReactElement;
  activated: boolean;
}> = ({ name, navigation, activated }) => (
  <ListItem
    activated={activated}
    tag={props => {
      const element = navigation(name);
      return { ...element, props: { ...element.props, ...props } };
    }}
  >
    <ListItemGraphic
      style={{ width: '36px', height: '36px' }}
      icon={{
        strategy: 'component',
        icon: databaseIcon,
      }}
    />
    <ListItemText>{name}</ListItemText>
  </ListItem>
);

export const DatabasePicker: React.FC<Props> = ({
  primary,
  current,
  navigation,
  databases,
}) => {
  const secondaryDbs = databases ? databases.filter(db => db !== primary) : [];

  // Always show current database, which may not be in the list.
  if (current !== primary && secondaryDbs.indexOf(current) < 0) {
    secondaryDbs.push(current);
  }

  return (
    <div className="Database-Picker">
      <List>
        <ListGroup>
          <ListGroupSubheader>
            <Typography use="caption">Databases</Typography>
          </ListGroupSubheader>
          <DatabaseListItem
            activated={current === primary}
            name={primary}
            navigation={navigation}
          />
          <ListDivider />
          {secondaryDbs.map(db => (
            <DatabaseListItem
              key={db}
              activated={current === db}
              name={db}
              navigation={navigation}
            />
          ))}
        </ListGroup>
      </List>
    </div>
  );
};

export const mapStateToProps = ({ config }: AppState) => ({
  databases: config.config ? [config.config.projectId] : undefined,
});

export default connect(mapStateToProps)(DatabasePicker);
