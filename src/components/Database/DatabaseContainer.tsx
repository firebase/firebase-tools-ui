import { Button } from '@rmwc/button';
import { Card } from '@rmwc/card';
import { Elevation } from '@rmwc/elevation';
import { GridCell } from '@rmwc/grid';
import React, { ReactElement, useEffect, useState } from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';

import { AppState } from '../../store';
import { databasesSubscribe, databasesUnsubscribe } from '../../store/database';
import { Callout } from '../common/Callout';
import DatabasePicker from './DatabasePicker';

export interface PropsFromState {
  databases: string[] | undefined;
}

export interface PropsFromDispatch {
  databasesSubscribe: () => void;
  databasesUnsubscribe: () => void;
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
  databasesSubscribe,
  databasesUnsubscribe,
}) => {
  useEffect(() => {
    databasesSubscribe();
    return databasesUnsubscribe; // Unsubscribe when unmounting.
  }, [databasesSubscribe, databasesUnsubscribe]);
  const [dbs, setDbs] = useState(databases);

  let hasNewDbs = false;
  if (databases !== dbs) {
    if (
      dbs === undefined ||
      databases === undefined ||
      dbs.join('|') === databases.join('|') // databases from state are sorted
    ) {
      // Don't show reload button for initial data or unchanged.
      setDbs(databases);
    } else {
      hasNewDbs = true;
    }
  }

  return (
    <>
      {hasNewDbs && (
        <GridCell span={12}>
          <Callout
            icon="info"
            actions={
              <Button theme="secondary" onClick={() => setDbs(databases)}>
                Reload
              </Button>
            }
          >
            There are new databases that have been created. Reload the page to
            view them.
          </Callout>
        </GridCell>
      )}
      <GridCell span={12}>
        <Elevation z={2} wrap>
          <Card className="canvas-card">
            <div className="Database">
              <DatabasePicker
                current={current}
                primary={primary}
                navigation={navigation}
                databases={dbs}
              />
              <div style={{ flex: 1 }}>{children}</div>
            </div>
          </Card>
        </Elevation>
      </GridCell>
    </>
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
  databasesSubscribe: () => void dispatch(databasesSubscribe()),
  databasesUnsubscribe: () => void dispatch(databasesUnsubscribe()),
});

export default connect(mapStateToProps, mapDispatchToProps)(DatabaseContainer);
