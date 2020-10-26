import { DialogButton } from '@rmwc/dialog';
import React from 'react';

import { Callout } from '../../common/Callout';
import { confirm } from '../../common/DialogQueue';

export const confirmClearAll = () =>
  confirm({
    title: 'Clear all data',
    body: (
      <div className="Firestore--dialog-body">
        <Callout aside type="warning">
          This will delete all users
        </Callout>
      </div>
    ),
    // hide standard buttons so as to use `danger` button
    acceptLabel: null,
    cancelLabel: null,
    footer: (
      <>
        <DialogButton action="close" type="button" theme="secondary">
          Cancel
        </DialogButton>
        <DialogButton unelevated action="accept" isDefaultAction danger>
          Delete
        </DialogButton>
      </>
    ),
  });
