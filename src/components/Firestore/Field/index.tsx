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

import React from 'react';
import { firestore } from 'firebase';
import { IconButton } from '@rmwc/icon-button';
import { ListItem, ListItemMeta } from '@rmwc/list';

import { getFieldType } from './utils';
import { useDocumentRef } from './DocumentRefContext';

import './index.scss';

export const Field: React.FC<{
  id: string;
  value: any;
}> = ({ id, value }) => {
  const reference = useDocumentRef();

  function handleDeleteField() {
    reference.update({ [id]: firestore.FieldValue.delete() });
  }

  return (
    <ListItem>
      {id}: {JSON.stringify(value)}
      <ListItemMeta className="Firestore-Field-actions">
        ({getFieldType(value)})
        <IconButton
          icon="delete"
          label="Remove field"
          onClick={handleDeleteField}
        />
      </ListItemMeta>
    </ListItem>
  );
};
