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
import { setCustomAuthActionUriRequest } from '../../../store/auth/actions';
import { getCustomAuthActionUri } from '../../../store/auth/selectors';
import { Field } from '../../common/Field';
import styles from '../OneAccountPerEmailCard/OneAccountPerEmailDialog.module.scss'; // The styles are the same for both dialogs

interface CustomAuthActionUriDialogProps {
  onClose: () => void;
}

type Props = PropsFromDispatch & PropsFromStore & CustomAuthActionUriDialogProps;

export const CustomAuthActionUriDialog: React.FC<
  React.PropsWithChildren<Props>
> = ({ customAuthActionUri, onClose, setCustomAuthActionUri }) => {
  const [value, setValue] = React.useState(customAuthActionUri);

  return (
    <Dialog renderToPortal open onClose={onClose}>
      <DialogTitle>Auth Action Handler Settings</DialogTitle>
      <form
        onSubmit={(e: React.FormEvent<unknown>) => {
          e.preventDefault();
          setCustomAuthActionUri(value);
          onClose();
        }}
      >
        <DialogContent>
          <Typography use="body2" className={styles.description}>
            This setting allows you to test a custom auth action handler
            for when users try to verify their emails, reset their passwords,
            or revoke an email address change.
          </Typography>           
          <Field 
            value={value}
            onChange={(event: any) => setValue(event.target.value)}
            label="Custom handler URL"
            type="url"
            placeholder="Leave blank to use the default handler"
          />
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
  customAuthActionUri: getCustomAuthActionUri,
});

export type PropsFromStore = ReturnType<typeof mapStateToProps>;

export interface PropsFromDispatch {
  setCustomAuthActionUri: typeof setCustomAuthActionUriRequest;
}

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = (dispatch) => ({
  setCustomAuthActionUri: (value: string) =>
    dispatch(setCustomAuthActionUriRequest(value)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomAuthActionUriDialog);
