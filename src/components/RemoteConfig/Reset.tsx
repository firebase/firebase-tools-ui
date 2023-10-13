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
import React, { useReducer } from 'react';

import Snackbar from '../common/Snackbar';
import styles from './RemoteConfig.module.scss';

export const queue = createSnackbarQueue();

export type ResetDialogProps = {
  open: boolean;
  cancel: () => void;
  reset: () => Promise<void>;
};

export default function ResetButton({ reset }: { reset: () => Promise<void> }) {
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
      <Button unelevated onClick={() => dispatch('SHOW_RESET_DIALOG')}>
        Reset
      </Button>
      <ResetDialog
        open={state.dialogOpen}
        cancel={() => dispatch('RESET_CANCEL')}
        reset={uiReset}
      />
      <Snackbar
        open={state.showToast}
        onClose={() => dispatch('HIDE_TOAST')}
        message="Template reset"
      />
    </>
  );
}

function ResetDialog({ open, cancel, reset }: ResetDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={(event) => {
        if (event.detail.action === 'reset') {
          reset();
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
        <DialogButton action="reset" isDefaultAction>
          Reset
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
}
