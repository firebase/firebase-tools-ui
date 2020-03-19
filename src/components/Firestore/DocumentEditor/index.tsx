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

import { IconButton } from '@rmwc/icon-button';
import { Select } from '@rmwc/select';
import { TextField } from '@rmwc/textfield';
import React, { useEffect, useState } from 'react';

import { FieldType, FirestoreAny, FirestoreMap } from '../models';
import {
  getFieldType,
  isArray,
  isBoolean,
  isGeoPoint,
  isMap,
  isNumber,
  isPrimitive,
  isReference,
  isString,
  isTimestamp,
  lastFieldName,
} from '../utils';
import * as actions from './actions';
import BooleanEditor from './BooleanEditor';
import GeoPointEditor from './GeoPointEditor';
import NumberEditor from './NumberEditor';
import ReferenceEditor from './ReferenceEditor';
import {
  DocumentProvider,
  useDocumentDispatch,
  useDocumentState,
  useFieldState,
} from './store';
import StringEditor from './StringEditor';
import TimestampEditor from './TimestampEditor';

/** Entry point for a Document/Field editor */
const DocumentEditor: React.FC<{
  value: FirestoreMap;
  onChange?: (value: FirestoreMap) => void;
  areRootKeysMutable?: boolean;
}> = ({ value, onChange, areRootKeysMutable = true }) => {
  return (
    <DocumentProvider value={value}>
      <RootField onChange={onChange} areRootKeysMutable={areRootKeysMutable} />
    </DocumentProvider>
  );
};

/**
 * Special representation of a Document Root, where we don't want to show
 * the implicit top-level map.
 */
const RootField: React.FC<{
  onChange?: (value: FirestoreMap) => void;
  areRootKeysMutable: boolean;
}> = ({ onChange, areRootKeysMutable }) => {
  const state = useDocumentState();

  useEffect(() => {
    onChange && onChange(state);
  }, [onChange, state]);

  return (
    <>
      {Object.keys(state).map(field => (
        <NestedEditor
          key={field}
          path={[field]}
          isKeyMutable={areRootKeysMutable}
        />
      ))}
    </>
  );
};

/**
 * Field with call-to-actions for editing as well as rendering applicable child-nodes
 */
const NestedEditor: React.FC<{
  path: string[];
  isKeyMutable: boolean;
}> = ({ path, isKeyMutable }) => {
  const state = useFieldState(path);
  const dispatch = useDocumentDispatch()!;
  const [key, setKey] = useState(lastFieldName(path));

  let childEditors = null;
  if (isMap(state)) {
    childEditors = Object.keys(state).map(childLeaf => {
      const childPath = [...path, childLeaf];
      return (
        <NestedEditor key={childLeaf} path={childPath} isKeyMutable={true} />
      );
    });
  } else if (isArray(state)) {
    childEditors = state.map((value, index) => {
      const childPath = [...path, `${index}`];
      return <NestedEditor key={index} path={childPath} isKeyMutable={false} />;
    });
  }

  function handleEditValue(value: FirestoreAny) {
    dispatch(actions.updateField({ path, value }));
  }

  const fieldEditor = (
    <>
      {isString(state) && (
        <StringEditor value={state} onChange={handleEditValue} />
      )}
      {isNumber(state) && (
        <NumberEditor value={state} onChange={handleEditValue} />
      )}
      {isBoolean(state) && (
        <BooleanEditor value={state} onChange={handleEditValue} />
      )}
      {isGeoPoint(state) && (
        <GeoPointEditor value={state} onChange={handleEditValue} />
      )}
      {isTimestamp(state) && (
        <TimestampEditor value={state} onChange={handleEditValue} />
      )}
      {isReference(state) && (
        <ReferenceEditor value={state} onChange={handleEditValue} />
      )}
    </>
  );

  function handleKeyChange(e: React.FormEvent<HTMLInputElement>) {
    setKey(e.currentTarget.value);
  }

  function handleKeyBlur(e: React.FormEvent<HTMLInputElement>) {
    dispatch(actions.updateKey({ path, key }));
  }

  return (
    <>
      <div style={{ display: 'flex' }}>
        <TextField
          {...(isKeyMutable
            ? {
                onChange: handleKeyChange,
                onBlur: handleKeyBlur,
              }
            : { readOnly: true, disabled: true })}
          value={key}
          outlined
          label="Field"
        />
        <Select
          label="Type"
          outlined
          options={[
            FieldType.STRING,
            FieldType.NUMBER,
            FieldType.BOOLEAN,
            FieldType.MAP,
            FieldType.ARRAY,
            FieldType.NULL,
            FieldType.TIMESTAMP,
            FieldType.GEOPOINT,
            FieldType.REFERENCE,
          ]}
          value={getFieldType(state)}
          onChange={e => {
            dispatch(actions.updateType({ path, type: e.currentTarget.value }));
          }}
        />
        {fieldEditor}
        {isMap(state) && (
          <IconButton
            icon="add"
            label="Add field"
            onClick={e =>
              dispatch(actions.addField({ path: [...path, ''], value: '' }))
            }
          />
        )}
        {isArray(state) && (
          <IconButton
            icon="add"
            label="Add field"
            onClick={e =>
              dispatch(
                actions.addField({
                  path: [...path, `${path.length}`],
                  value: '',
                })
              )
            }
          />
        )}
        {path.length > 1 && isPrimitive(state) && (
          <IconButton
            icon="delete"
            label="Remove field"
            onClick={() => dispatch(actions.deleteField(path))}
          />
        )}
      </div>
      {childEditors && <div>{childEditors}</div>}
    </>
  );
};

export default DocumentEditor;
