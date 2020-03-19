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

import './FieldPreview.scss';

import { Icon } from '@rmwc/icon';
import { IconButton } from '@rmwc/icon-button';
import { ListItem, ListItemMeta } from '@rmwc/list';
import { Theme } from '@rmwc/theme';
import classnames from 'classnames';
import { firestore } from 'firebase';
import React, { useState } from 'react';

import {
  getFieldType,
  isArray,
  isMap,
  isPrimitive,
  lastFieldName,
} from '../utils';
import { deleteField, updateField } from './api';
import InlineEditor from './InlineEditor';
import { useDocumentState, useFieldState } from './store';

const FieldPreview: React.FC<{
  path: string[];
  documentRef: firestore.DocumentReference;
}> = ({ path, documentRef }) => {
  const documentData = useDocumentState();
  const state = useFieldState(path);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingField, setIsAddingField] = useState(false);

  let addPath: string[] = [];
  let childFields = null;
  if (isMap(state)) {
    // Inline editor for new field will default to key: ''
    addPath = [...path, ''];
    childFields = Object.keys(state).map(childLeaf => {
      const childPath = [...path, childLeaf];
      return (
        <FieldPreview
          key={childLeaf}
          path={childPath}
          documentRef={documentRef}
        />
      );
    });
  } else if (isArray(state)) {
    // Inline editor for new field will default to key: '{index}'
    addPath = [...path, `${state.length}`];
    childFields = state.map((value, index) => {
      const childPath = [...path, `${index}`];
      return (
        <FieldPreview key={index} path={childPath} documentRef={documentRef} />
      );
    });
  }

  return isEditing ? (
    <InlineEditor
      value={{ [lastFieldName(path)]: state }}
      path={path}
      onCancel={() => {
        setIsEditing(false);
      }}
      onSave={(key, value) => {
        updateField(documentRef, documentData, path, value[key]);
        setIsEditing(false);
      }}
    />
  ) : (
    <>
      <ListItem
        onClick={() => setIsExpanded(!isExpanded)}
        className={classnames('FieldPreview', {
          'FieldPreview--primitive': isPrimitive(state),
          'FieldPreview--expanded': !isPrimitive(state) && isExpanded,
        })}
      >
        <Icon
          className="FieldPreview-expand-icon"
          icon={{
            size: 'xsmall',
            icon: isExpanded ? 'arrow_drop_down' : 'arrow_right',
          }}
        />
        <Theme
          use="textSecondaryOnBackground"
          tag="span"
          className="FieldPreview-key"
        >
          {lastFieldName(path)}
        </Theme>
        <span className="FieldPreview-summary">{JSON.stringify(state)}</span>
        <ListItemMeta className="FieldPreview-actions">
          <span className="FieldPreview-type">({getFieldType(state)})</span>
          {isPrimitive(state) ? (
            <IconButton
              icon="edit"
              label="Edit field"
              onClick={e => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            />
          ) : (
            <IconButton
              icon="add"
              label="Add field"
              onClick={e => {
                e.stopPropagation();
                setIsAddingField(true);
              }}
            />
          )}
          <IconButton
            icon="delete"
            label="Remove field"
            onClick={e => {
              e.stopPropagation();
              deleteField(documentRef, documentData, path);
            }}
          />
        </ListItemMeta>
      </ListItem>
      {addPath && isAddingField && (
        <InlineEditor
          value={{ [lastFieldName(addPath)]: '' }}
          path={addPath}
          onCancel={() => {
            setIsAddingField(false);
          }}
          onSave={(key, value) => {
            updateField(documentRef, documentData, addPath, value[key]);
            setIsAddingField(false);
          }}
        />
      )}
      {!isPrimitive(state) && isExpanded && (
        <div className="FieldPreview-children">{childFields}</div>
      )}
    </>
  );
};

export default FieldPreview;
