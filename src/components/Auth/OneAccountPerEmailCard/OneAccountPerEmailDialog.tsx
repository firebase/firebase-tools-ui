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
import { Radio } from '@rmwc/radio';
import { Typography } from '@rmwc/typography';
import React from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';

import { createStructuredSelector } from '../../../store';
import { setAllowDuplicateEmailsRequest } from '../../../store/auth/actions';
import { getAllowDuplicateEmails } from '../../../store/auth/selectors';
import styles from './OneAccountPerEmailDialog.module.scss';

interface OneAccountPerEmailDialogProps {
  onClose: () => void;
}

type Props = PropsFromDispatch & PropsFromStore & OneAccountPerEmailDialogProps;

export const OneAccountPerEmailDialog: React.FC<
  React.PropsWithChildren<Props>
> = ({ allowDuplicateEmails, onClose, setAllowDuplicateEmails }) => {
  const [value, setValue] = React.useState(allowDuplicateEmails);

  return (
    <Dialog renderToPortal open onClose={onClose}>
      <DialogTitle>Account email address settings</DialogTitle>
      <form
        onSubmit={(e: React.FormEvent<unknown>) => {
          e.preventDefault();
          setAllowDuplicateEmails(value);
          onClose();
        }}
      >
        <DialogContent>
          <Typography use="body2" className={styles.description}>
            This setting either prevents or allows users to create multiple
            accounts using the same email address if they sign in to your app
            using different authentication providers.
          </Typography>
          <Radio
            value="false"
            checked={!value}
            onChange={() => setValue(false)}
            onClick={() => setValue(false)}
          >
            Prevent creation of multiple accounts with the same email address
          </Radio>

          <Radio
            value="true"
            checked={value}
            onChange={() => setValue(true)}
            onClick={() => setValue(true)}
          >
            Allow creation of multiple accounts with the same email address
          </Radio>
        </DialogContent>
        <DialogActions>
          <DialogButton action="close" type="button" theme="secondary">
            Cancel
          </DialogButton>
          <DialogButton type="submit" unelevated>
            Save
          </DialogButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export const mapStateToProps = createStructuredSelector({
  allowDuplicateEmails: getAllowDuplicateEmails,
});

export type PropsFromStore = ReturnType<typeof mapStateToProps>;

export interface PropsFromDispatch {
  setAllowDuplicateEmails: typeof setAllowDuplicateEmailsRequest;
}

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = (dispatch) => ({
  setAllowDuplicateEmails: (value: boolean) =>
    dispatch(setAllowDuplicateEmailsRequest(value)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OneAccountPerEmailDialog);
