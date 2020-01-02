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
import * as React from 'react';
import { EditNode } from './EditNode';
import { useState } from 'react';
import { IconButton } from '@rmwc/icon-button';
import { Typography } from '@rmwc/typography';
import { ValueDisplay } from './ValueDisplay';
import { Tooltip } from '@rmwc/tooltip';

export interface Props {
  realtimeRef: firebase.database.Reference;
  value: string | boolean | number;
}

export const NodeLeaf = React.memo<Props>(function NodeLeaf$({
  value,
  realtimeRef,
}) {
  const key = realtimeRef.key || realtimeRef.toString();
  const [isEditing, setIsEditing] = useState(false);
  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const removeNode = async () => {
    try {
      await realtimeRef.remove();
    } catch (e) {
      throw e;
    }
  };

  return (
    <div className="NodeLeaf">
      {isEditing && (
        <EditNode
          value={value}
          realtimeRef={realtimeRef}
          onClose={() => setIsEditing(false)}
        />
      )}
      <div className="NodeLeaf__key">
        <Typography use="body1">{key}:</Typography>{' '}
        <ValueDisplay use="body1" value={value} onClick={toggleEditing} />
      </div>
      <span className="NodeLeaf__actions">
        <Tooltip content="Edit value">
          <IconButton icon="edit" onClick={toggleEditing} />
        </Tooltip>
        <Tooltip content="Delete value">
          <IconButton icon="delete" onClick={removeNode} />
        </Tooltip>
      </span>
    </div>
  );
});
