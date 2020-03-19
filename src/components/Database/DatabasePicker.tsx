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

import './DatabasePicker.scss';

import {
  List,
  ListDivider,
  ListGroup,
  ListGroupSubheader,
  ListItem,
  ListItemGraphic,
  ListItemText,
} from '@rmwc/list';
import { Theme } from '@rmwc/theme';
import { Typography } from '@rmwc/typography';
import React, { ReactElement } from 'react';

import { databaseIcon } from './icons';

export interface PropsFromState {
  databases: string[] | undefined;
}

export type Props = PropsFromState & {
  primary: string;
  current: string;
  navigation: (db: string) => ReactElement;
};

const databaseIconSize = { width: '36px', height: '36px' };

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
    <Theme use="primary" wrap>
      <ListItemGraphic style={databaseIconSize} icon={databaseIcon} />
    </Theme>
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

  let pickerClassName = 'Database-Picker';
  if (secondaryDbs.length === 0) {
    pickerClassName += ' Database-Picker--primary-only';
  }

  return (
    <div className={pickerClassName}>
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

export default DatabasePicker;
