import { Button } from '@rmwc/button';
import React from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';

import { clearAllData } from '../../../store/auth/actions';
import { CustomThemeProvider } from '../../../themes';
import styles from './UsersCard.module.scss';

export const ClearAll: React.FC<PropsFromDispatch> = ({ clearAllData }) => {
  return (
    <div className={styles.clearAllButton}>
      <CustomThemeProvider use="warning" wrap>
        <Button unelevated onClick={() => clearAllData()}>
          Clear all data
        </Button>
      </CustomThemeProvider>
    </div>
  );
};

export interface PropsFromDispatch {
  clearAllData: typeof clearAllData;
}

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = dispatch => ({
  clearAllData: () => dispatch(clearAllData()),
});

export default connect(null, mapDispatchToProps)(ClearAll);
