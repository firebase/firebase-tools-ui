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

import './NodeLeaf.scss';

import { IconButton } from '@rmwc/icon-button';
import { Tooltip } from '@rmwc/tooltip';
import firebase from 'firebase';
import * as React from 'react';
import { useState } from 'react';

import InlineEditor from '../../Firestore/DocumentPreview/InlineEditor';
import { FirestoreAny } from '../../Firestore/models';
import { NodeLink } from './NodeLink';
import { ValueDisplay } from './ValueDisplay';

export interface Props {
  realtimeRef: firebase.database.Reference;
  value: string | boolean | number | null;
}

export const NodeLeaf = React.memo<Props>(function NodeLeaf$({
  value,
  realtimeRef,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleEditSuccess = async (key: string, value: FirestoreAny) => {
    await realtimeRef.set(value);
    setIsEditing(false);
  };

  const handleAdd = () => {
    setIsAdding(!isAdding);
  };

  const handleAddSuccess = async (key: string, value: FirestoreAny) => {
    await realtimeRef.child(key).set(value);
    setIsAdding(false);
  };

  const handleDelete = async () => {
    try {
      await realtimeRef.remove();
    } catch (e) {
      throw e;
    }
  };

  const showAddButton = !realtimeRef.parent && value === null;
  return (
    <div className="NodeLeaf">
      <div className="NodeLeaf__key">
        <NodeLink dbRef={realtimeRef} />
        {': '}
        <ValueDisplay use="body1" value={value} onClick={handleEdit} />
      </div>
      <span className="NodeLeaf__actions">
        <Tooltip content="Edit value">
          <IconButton
            icon="edit"
            onClick={handleEdit}
            aria-label="Edit value"
          />
        </Tooltip>
        {showAddButton && (
          <Tooltip content="Add child">
            <IconButton icon="add" onClick={handleAdd} aria-label="Add child" />
          </Tooltip>
        )}
        <Tooltip content="Delete value">
          <IconButton
            icon="delete"
            onClick={handleDelete}
            aria-label="Delete value"
          />
        </Tooltip>
      </span>
      <div className="NodeLeaf__edit-ui">
        {isEditing && (
          <InlineEditor
            rtdb
            value={{
              [realtimeRef.key || realtimeRef.toString()]:
                value === null ? '' : value,
            }}
            onCancel={() => setIsEditing(false)}
            onSave={handleEditSuccess}
            areRootKeysMutable={false}
          />
        )}
        {isAdding && (
          <InlineEditor
            rtdb
            value={{ [realtimeRef.push().key!]: '' }}
            onCancel={() => setIsAdding(false)}
            onSave={handleAddSuccess}
            areRootKeysMutable={true}
          />
        )}
      </div>
    </div>
  );
});
