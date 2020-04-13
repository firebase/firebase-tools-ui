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

import { supportsEditing } from '../DocumentEditor';
import { FieldType, FirestoreAny, FirestoreArray } from '../models';
import {
  getFieldType,
  getParentPath,
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
    childFields = Object.keys(state).map(childLeaf => {
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
        />
      )}

      {!isPrimitive(state) && isExpanded && (
        <div className="FieldPreview-children">{childFields}</div>
      )}
    </>
  );
};

// Give a brief text summary of the data.
// Note: maxLen is soft (at least for now). End result may still be longer.
function summarize(data: FirestoreAny, maxLen: number): string {
  switch (getFieldType(data)) {
    case FieldType.ARRAY:
      return summarizeArray(data as FirestoreAny[], maxLen);
    case FieldType.MAP:
      return summarizeMap(data as Record<string, FirestoreAny>, maxLen);
    case FieldType.BLOB:
      const base64 = (data as firestore.Blob).toBase64();
      if (base64.length < maxLen) return base64;
      else return base64.substr(0, maxLen) + '...';
    case FieldType.BOOLEAN:
      return (data as boolean).toString();
    case FieldType.GEOPOINT:
      const value = data as firestore.GeoPoint;
      return `[${latStr(value.latitude)}, ${longStr(value.longitude)}]`;
    case FieldType.NULL:
      return 'null';
    case FieldType.NUMBER:
      return (data as number).toString();
    case FieldType.REFERENCE:
      return (data as firestore.DocumentReference).path;
    case FieldType.STRING:
      return `"${data as string}"`;
    case FieldType.TIMESTAMP:
      // TODO: Better date time formatting.
      // Note: Not using toLocaleString() since it does not stringify timezone.
      return (data as firestore.Timestamp).toDate().toString();
  }
}

function summarizeArray(array: FirestoreAny[], maxLen: number): string {
  let output = '[';
  for (const element of array) {
    if (output.length > 1) output += ', ';
    if (output.length > maxLen) {
      output += '...';
      break;
    }
    output += summarize(element, maxLen - output.length);
  }
  output += ']';
  return output;
}

function summarizeMap(
  map: Record<string, FirestoreAny>,
  maxLen: number
): string {
  let output = '{';
  for (const [key, value] of Object.entries(map)) {
    if (output.length > 1) output += ', ';
    if (output.length > maxLen) {
      output += '...';
      break;
    }
    output += `${key}: ${summarize(value, maxLen - output.length)}`;
  }
  output += '}';
  return output;
}

function latStr(lat: number): string {
  return `${Math.abs(lat)}° ${lat >= 0 ? 'N' : 'S'}`;
}

function longStr(long: number): string {
  return `${Math.abs(long)}° ${long >= 0 ? 'E' : 'W'}`;
}

export default FieldPreview;
