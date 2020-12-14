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
import firebase from 'firebase';
import React, { useState } from 'react';

import { supportsEditing } from '../DocumentEditor';
import { FirestoreArray } from '../models';
import {
  compareFirestoreKeys,
  getFieldType,
  getParentPath,
  isArray,
  isMap,
  isPrimitive,
  lastFieldName,
  summarize,
} from '../utils';
import { deleteField, updateField } from './api';
import InlineEditor from './InlineEditor';
import { useDocumentState, useFieldState } from './store';

const FieldPreview: React.FC<{
  path: string[];
  documentRef: firebase.firestore.DocumentReference;
  maxSummaryLen: number;
}> = ({ path, documentRef, maxSummaryLen }) => {
  const documentData = useDocumentState();
  const parentState = useFieldState(path.slice(0, -1));
  const state = useFieldState(path);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingField, setIsAddingField] = useState(false);

  let childFields = null;
  if (isMap(state)) {
    // Inline editor for new field will default to key: ''
    childFields = Object.keys(state)
      .sort(compareFirestoreKeys)
      .map(childLeaf => {
        const childPath = [...path, childLeaf];
        return (
          <FieldPreview
            key={childLeaf}
            path={childPath}
            documentRef={documentRef}
            maxSummaryLen={maxSummaryLen}
          />
        );
      });
  } else if (isArray(state)) {
    // Inline editor for new field will default to key: '{index}'
    childFields = state.map((value, index) => {
      const childPath = [...path, `${index}`];
      return (
        <FieldPreview
          key={index}
          path={childPath}
          documentRef={documentRef}
          maxSummaryLen={maxSummaryLen}
        />
      );
    });
  }

  return isEditing ? (
    <>
      {isArray(parentState) && (
        <InlineEditor
          value={[state] as FirestoreArray}
          onCancel={() => {
            setIsEditing(false);
          }}
          onSave={(key, value) => {
            updateField(documentRef, documentData, path, value);
            setIsEditing(false);
          }}
          areRootKeysMutable={false}
          firestore={documentRef.firestore}
        />
      )}
      {isMap(parentState) && (
        <InlineEditor
          value={{ [lastFieldName(path)]: state }}
          onCancel={() => {
            setIsEditing(false);
          }}
          onSave={(key, value) => {
            updateField(
              documentRef,
              documentData,
              [...getParentPath(path), key],
              value
            );
            setIsEditing(false);
          }}
          areRootKeysMutable={false}
          firestore={documentRef.firestore}
        />
      )}
    </>
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
        <Theme use="secondary" tag="span" className="FieldPreview-key">
          {lastFieldName(path)}
        </Theme>
        <span className="FieldPreview-summary">
          {summarize(state, maxSummaryLen)}
        </span>
        <ListItemMeta className="FieldPreview-actions">
          <span className="FieldPreview-type">({getFieldType(state)})</span>
          {isPrimitive(state) && supportsEditing(state) && (
            <IconButton
              icon="edit"
              label="Edit field"
              onClick={e => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            />
          )}{' '}
          {(isArray(state) || isMap(state)) && (
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

      {isAddingField && isArray(state) && (
        <InlineEditor
          value={['']}
          onCancel={() => {
            setIsAddingField(false);
          }}
          startingIndex={state.length}
          onSave={(key, value) => {
            const newPath = [...path, `${state.length}`];
            updateField(documentRef, documentData, newPath, value);
            setIsAddingField(false);
          }}
          areRootKeysMutable={!isArray(state)}
          firestore={documentRef.firestore}
        />
      )}

      {isAddingField && isMap(state) && (
        <InlineEditor
          value={{ '': '' }}
          onCancel={() => {
            setIsAddingField(false);
          }}
          onSave={(key, value) => {
            const newPath = [...path, key];
            updateField(documentRef, documentData, newPath, value);
            setIsAddingField(false);
          }}
          areRootKeysMutable={!isArray(state)}
          firestore={documentRef.firestore}
        />
      )}

      {!isPrimitive(state) && isExpanded && (
        <div className="FieldPreview-children">{childFields}</div>
      )}
    </>
  );
};

export default FieldPreview;
