/**
 * Copyright 2019 Google LLC
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
import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from '@rmwc/dialog';
import { createSnackbarQueue } from '@rmwc/snackbar';
import { Typography } from '@rmwc/typography';
import { useReducer } from 'react';

import Snackbar from '../common/Snackbar';
import styles from './RemoteConfig.module.scss';

export const queue = createSnackbarQueue();

export type ResetDialogProps = {
  open: boolean;
  cancel: () => void;
  reset: () => Promise<void>;
  revertChanges: () => void;
};

export type PublishDialogProps = {
  open: boolean;
  cancel: () => void;
  publish: () => Promise<void>;
};

export function ResetButton({ reset, revertChanges }: { reset: () => Promise<void>; revertChanges: () => void;}) {
  const [state, dispatch] = useReducer(
    (state: { dialogOpen: boolean; showToast: boolean }, action: string) => {
      const newState = { ...state };

      if (action === 'SHOW_RESET_DIALOG') {
        newState.dialogOpen = true;
        newState.showToast = false;
      } else if (action === 'RESET_STARTED') {
        reset().then();
      } else if (action === 'RESET_SUCCESS') {
        newState.dialogOpen = false;
        newState.showToast = true;
      } else if (action === 'RESET_CANCEL') {
        newState.dialogOpen = false;
        newState.showToast = false;
      } else if (action === 'HIDE_TOAST') {
        newState.showToast = false;
      }
      return newState;
    },
    {
      dialogOpen: false,
      showToast: false,
    }
  );

  async function uiReset() {
    dispatch('RESET_STARTED');
    await reset();
    dispatch('RESET_SUCCESS');
  }

  return (
    <>
      <Button onClick={() => dispatch('SHOW_RESET_DIALOG')}>
        Discard changes
      </Button>
      <ResetDialog
        open={state.dialogOpen}
        cancel={() => dispatch('RESET_CANCEL')}
        reset={uiReset}
        revertChanges={revertChanges}
      />
      <Snackbar
        open={state.showToast}
        onClose={() => dispatch('HIDE_TOAST')}
        message="Template reset"
      />
    </>
  );
}

function ResetDialog({ open, cancel, reset, revertChanges }: ResetDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={(event) => {
        if (event.detail.action === 'reset') {
          reset();
        } else if (event.detail.action === 'revert') {
          revertChanges();
        } else {
          cancel();
        }
      }}
    >
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent>
        <div className={styles.explainerSection}>
          <Typography use="body1">
            This will reset back to the values in remoteconfig.template.json,
            and will serve all default conditions.
          </Typography>
        </div>
      </DialogContent>
      <DialogActions>
        <DialogButton action="close">Cancel</DialogButton>
        <DialogButton action="revert">Revert to last publish</DialogButton>
        <DialogButton action="reset" isDefaultAction>
          Reset to template
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
}

export const PublishButton: React.FunctionComponent<{
  saveCurrentConfigs: () => Promise<void>;
  disabled: boolean;
}> = ({ saveCurrentConfigs, disabled }) => {

  const [state, dispatch] = useReducer(
    (state: { dialogOpen: boolean; showToast: boolean }, action: string) => {
      const newState = { ...state };

      if (action === 'SHOW_PUBLISH_DIALOG') {
        newState.dialogOpen = true;
        newState.showToast = false;
      } else if (action === 'PUBLISH_STARTED') {
        saveCurrentConfigs().then();
      } else if (action === 'PUBLISH_SUCCESS') {
        newState.dialogOpen = false;
        newState.showToast = true;
      } else if (action === 'PUBLISH_CANCEL') {
        newState.dialogOpen = false;
        newState.showToast = false;
      } else if (action === 'HIDE_TOAST') {
        newState.showToast = false;
      }
      return newState;
    },
    {
      dialogOpen: false,
      showToast: false,
    }
  );
  return (
    <>
      <Button
        unelevated
        disabled={disabled}
        onClick={() => dispatch('SHOW_PUBLISH_DIALOG')}>
        Publish changes
      </Button>
      <PublishDialog
        open={state.dialogOpen}
        cancel={() => dispatch('RESET_CANCEL')}
        publish={saveCurrentConfigs}
      />
            <Snackbar
        open={state.showToast}
        onClose={() => dispatch('HIDE_TOAST')}
        message="Template reset"
      />
    </>
  );
};

function PublishDialog({ open, cancel, publish }: PublishDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={(event) => {
        if (event.detail.action === 'publish') {
          publish();
        } else {
          cancel();
        }
      }}
    >
      <DialogTitle>Publishing</DialogTitle>
      <DialogContent>
        <div className={styles.explainerSection}>
          <Typography use="body1">
            This will publish your changes to your local emulator and app.
          </Typography>
        </div>
      </DialogContent>
      <DialogActions>
        <DialogButton action="close">Cancel</DialogButton>
        <DialogButton action="publish" isDefaultAction>Publish</DialogButton>
      </DialogActions>
    </Dialog>
  );
}
