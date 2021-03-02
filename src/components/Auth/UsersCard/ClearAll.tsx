/**
 * Copyright 2021 Google LLC
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

import { Button } from '@rmwc/button';
import React from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';

import { createStructuredSelector } from '../../../store';
import { nukeUsersRequest } from '../../../store/auth/actions';
import { hasUsers } from '../../../store/auth/selectors';
import { CustomThemeProvider } from '../../../themes';
import { confirmClearAll } from './confirmClearAllData';
import styles from './UsersCard.module.scss';

export type Props = PropsFromState & PropsFromDispatch;
export const ClearAll: React.FC<Props> = ({ hasUsers, clearAllData }) => {
  return (
    <>
      {hasUsers && (
        <div className={styles.clearAllButton}>
          <CustomThemeProvider use="warning" wrap>
            <Button
              unelevated
              onClick={async () => {
                if (await confirmClearAll()) {
                  clearAllData();
                }
              }}
            >
              Clear all data
            </Button>
          </CustomThemeProvider>
        </div>
      )}
    </>
  );
};

export interface PropsFromDispatch {
  clearAllData: typeof nukeUsersRequest;
}

export const mapStateToProps = createStructuredSelector({
  hasUsers: hasUsers,
});
export type PropsFromState = ReturnType<typeof mapStateToProps>;

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = (dispatch) => ({
  clearAllData: () => dispatch(nukeUsersRequest()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ClearAll);
