import { DialogButton } from '@rmwc/dialog';
import React from 'react';

import { Callout } from '../../../common/Callout';
import { confirm } from '../../../common/DialogQueue';
import { AuthUser } from '../../types';

export const confirmDeleteUser = (user: AuthUser) =>
  confirm({
    title: 'Delete user',
    body: (
      <div className="Firestore--dialog-body">
        <Callout aside type="warning">
          This will delete user with uid {user.localId}
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
