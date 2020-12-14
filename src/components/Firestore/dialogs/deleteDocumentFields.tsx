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

export const promptDeleteDocumentFields = (
  reference: firebase.firestore.DocumentReference
) =>
  confirm({
    title: 'Delete data',
    body: (
      <div className="Firestore--dialog-body">
        <Callout aside type="warning">
          This will delete all fields of the document, excluding subcollections.
        </Callout>
        <Field
          label="Document location"
          value={reference.path || '/'}
          fullwidth
          disabled
        />
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
