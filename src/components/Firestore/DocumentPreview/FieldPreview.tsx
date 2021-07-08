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
import React, { useCallback, useState } from 'react';

import { supportsEditing } from '../DocumentEditor';
import { FirestoreArray } from '../models';
import {
  getParentPath,
  isArray,
  isMap,
  isPrimitive,
  lastFieldName,
} from '../utils';
import { deleteField, updateField } from './api';
import InlineEditor from './InlineEditor';
import { useDocumentState, useFieldInfo, useFieldState } from './store';

export interface CommonPreviewProps {
  path: string[];
  maxSummaryLen: number;
}

export interface FieldPreviewProps extends CommonPreviewProps {
  actions?: React.ReactNode;
  childComponent?: React.ComponentType<CommonPreviewProps>;
}

export const FieldPreview: React.FC<FieldPreviewProps> = ({
  path,
  maxSummaryLen,
  children,
  actions,
  childComponent: ChildComponent = FieldPreview,
}) => {
  const { summary, title, typeDisp, childPaths } = useFieldInfo(path, {
    maxSummaryLen,
  });
  const [isExpanded, setIsExpanded] = useState(
    !childPaths || childPaths.length > 0
  );

  return (
    <>
      <ListItem
        onClick={() => path.length && setIsExpanded(!isExpanded)}
        className={classnames('FieldPreview', {
          'FieldPreview--primitive': !childPaths,
          'FieldPreview--expanded': childPaths && isExpanded,
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
          {path[path.length - 1] || ''}
        </Theme>
        <span className="FieldPreview-summary" title={title}>
          {summary}
        </span>
        <ListItemMeta className="FieldPreview-actions">
          <span className="FieldPreview-type">({typeDisp})</span>
          {actions}
        </ListItemMeta>
      </ListItem>

      {children}

      {childPaths && isExpanded && (
        <div
          className={
            path.length
              ? 'FieldPreview-children'
              : 'FieldPreview-top-level-fields'
          }
        >
          {childPaths.map((path) => {
            return (
              <ChildComponent
                path={path}
                key={lastFieldName(path)}
                maxSummaryLen={maxSummaryLen}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

export const EditableFieldPreview: React.FC<
  CommonPreviewProps & {
    documentRef: firebase.firestore.DocumentReference;
  }
> = ({ path, documentRef, maxSummaryLen }) => {
  const documentData = useDocumentState();
  const parentState = useFieldState(path.slice(0, -1));
  const state = useFieldState(path);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingField, setIsAddingField] = useState(false);
  const childComponent = useCallback(
    (props: CommonPreviewProps) => (
      <EditableFieldPreview documentRef={documentRef} {...props} />
    ),
    [documentRef]
  );

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
    <FieldPreview
      path={path}
      maxSummaryLen={maxSummaryLen}
      childComponent={childComponent}
      actions={
        <>
          {isPrimitive(state) && supportsEditing(state) && (
            <IconButton
              icon="edit"
              label="Edit field"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            />
          )}{' '}
          {(isArray(state) || isMap(state)) && (
            <IconButton
              icon="add"
              label="Add field"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddingField(true);
              }}
            />
          )}
          <IconButton
            icon="delete"
            label="Remove field"
            onClick={(e) => {
              e.stopPropagation();
              deleteField(documentRef, documentData, path);
            }}
          />
        </>
      }
    >
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
    </FieldPreview>
  );
};
