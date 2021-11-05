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

import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from '@rmwc/dialog';
import { Typography } from '@rmwc/typography';
import React from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';

import { createStructuredSelector } from '../../../store';
import { setUsageModeRequest } from '../../../store/auth/actions';
import { getUsageMode } from '../../../store/auth/selectors';
import { Callout } from '../../common/Callout';
import { UsageMode } from '../types';
import styles from './PassthroughModeDialog.module.scss';

interface PassthroughModeDialogProps {
  onClose: () => void;
}
type Props = PropsFromDispatch & PropsFromStore & PassthroughModeDialogProps;

export const PassthroughModeDialog: React.FC<Props> = ({
  usageMode,
  onClose,
  setUsageMode,
}) => {
  return (
    <Dialog renderToPortal open onClose={onClose}>
      <DialogTitle>
        {usageMode === UsageMode.DEFAULT ? 'Enable' : 'Disable'} passthrough
        mode
      </DialogTitle>
      <form
        onSubmit={(e: React.FormEvent<unknown>) => {
          e.preventDefault();
          setUsageMode(
            usageMode === UsageMode.PASSTHROUGH
              ? UsageMode.DEFAULT
              : UsageMode.PASSTHROUGH
          );
          onClose();
        }}
      >
        <DialogContent>
          {usageMode === UsageMode.DEFAULT ? (
            <div className={styles.description}>
              <Callout aside type="warning">
                All users in the Auth Emulator will be deleted
              </Callout>
            </div>
          ) : null}
          <Typography use="body2" className={styles.description}>
            {usageMode === UsageMode.PASSTHROUGH
              ? 'Disabling passthrough mode means users will be saved in the Auth emulator'
              : 'Enabling passthrough mode deletes all users currently in the Auth Emulator'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <DialogButton action="close" type="button" theme="secondary">
            Cancel
          </DialogButton>
          <DialogButton type="submit" unelevated>
            {usageMode === UsageMode.PASSTHROUGH
              ? 'Disable passthrough'
              : 'Enable passthrough'}
          </DialogButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export const mapStateToProps = createStructuredSelector({
  usageMode: getUsageMode,
});

export type PropsFromStore = ReturnType<typeof mapStateToProps>;

export interface PropsFromDispatch {
  setUsageMode: typeof setUsageModeRequest;
}

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = (dispatch) => ({
  setUsageMode: (usageMode: UsageMode) =>
    dispatch(setUsageModeRequest(usageMode)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PassthroughModeDialog);
