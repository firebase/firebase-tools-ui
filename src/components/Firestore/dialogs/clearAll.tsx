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
import React from 'react';

import { confirm } from '../../common/DialogQueue';

export const promptClearAll = () =>
  confirm({
    title: 'Delete all data?',
    body: `Proceeding will delete all your collections, sub-collections and
             documents within your database.`,
    // hide standard buttons so as to use `danger` button
    acceptLabel: null,
    cancelLabel: null,
    footer: (
      <>
        <DialogButton type="button" theme="secondary" action="close">
          Cancel
        </DialogButton>
        <DialogButton unelevated action="accept" isDefaultAction danger>
          Clear
        </DialogButton>
      </>
    ),
  });
