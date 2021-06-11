/**
 * Copyright 2020 Google LLC
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

import { DialogButton } from '@rmwc/dialog';
import firebase from 'firebase';
import React from 'react';

import { Callout } from '../../common/Callout';
import { confirm } from '../../common/DialogQueue';
import { Field } from '../../common/Field';

export const promptDeleteCollection = (
  reference: firebase.firestore.CollectionReference
) =>
  confirm({
    title: 'Delete collection',
    body: (
      <div className="Firestore--dialog-body">
        <Callout aside type="warning">
          This will permanently delete the collection, including all nested
          documents and collections.
        </Callout>
        <Field
          label="Collection path"
          value={`/${reference.path}`}
          fullwidth
          disabled
        />
        <Callout aside type="note">
          Cloud Functions triggers <b>will not</b> be executed.
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
