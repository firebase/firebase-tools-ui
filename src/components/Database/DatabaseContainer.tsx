import { Card } from '@rmwc/card';
import { Elevation } from '@rmwc/elevation';
import { GridCell } from '@rmwc/grid';
import React, { ReactElement, useEffect } from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';

import { AppState } from '../../store';
import { databasesFetchRequest } from '../../store/database';
import DatabasePicker from './DatabasePicker';

export interface PropsFromState {
  databases: string[] | undefined;
}

export interface PropsFromDispatch {
  fetchDatabases: () => void;
}

export type Props = PropsFromState &
  PropsFromDispatch & {
    children?: React.ReactNode;
    current: string;
    primary: string;
    navigation: (db: string) => ReactElement;
  };

export const DatabaseContainer: React.FC<Props> = ({
  current,
  primary,
  navigation,
  databases,
  children,
  fetchDatabases,
}) => {
  useEffect(() => fetchDatabases(), [fetchDatabases]);

  return (
    <GridCell span={12}>
      <Elevation z={2} wrap>
        <Card className="canvas-card">
          <div className="Database">
            <DatabasePicker
              current={current}
              primary={primary}
              navigation={navigation}
              databases={databases}
            />
            <div style={{ flex: 1 }}>{children}</div>
          </div>
        </Card>
      </Elevation>
    </GridCell>
  );
};

export const mapStateToProps = ({ database }: AppState): PropsFromState => ({
  databases:
    database.databases.databases &&
    database.databases.databases.map(({ name }) => name),
});

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = dispatch => ({
  fetchDatabases: () => void dispatch(databasesFetchRequest()),
});

export default connect(mapStateToProps, mapDispatchToProps)(DatabaseContainer);
