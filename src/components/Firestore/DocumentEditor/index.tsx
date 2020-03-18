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

import { TextField } from '@rmwc/textfield';
import React, { useEffect } from 'react';

import { FirestoreAny, FirestoreMap } from '../models';
import {
  isArray,
  isBoolean,
  isString,
  isGeoPoint,
  isNumber,
  isMap,
  isReference,
  isTimestamp,
  lastFieldName,
  getFieldType,
} from '../utils';
import * as actions from './actions';
import {
  DocumentProvider,
  useDocumentDispatch,
  useDocumentState,
  useFieldState,
} from './store';
import BooleanEditor from './BooleanEditor';
import GeoPointEditor from './GeoPointEditor';
import NumberEditor from './NumberEditor';
import ReferenceEditor from './ReferenceEditor';
import StringEditor from './StringEditor';
import TimestampEditor from './TimestampEditor';

/** Entry point for a Document/Field editor */
const DocumentEditor: React.FC<{
  value: FirestoreMap;
  onChange?: (value: FirestoreMap) => void;
}> = ({ value, onChange }) => {
  return (
    <DocumentProvider value={value}>
      <RootField onChange={onChange} />
    </DocumentProvider>
  );
};

/**
 * Special representation of a Document Root, where we don't want to show
 * the implicit top-level map.
 */
const RootField: React.FC<{
  onChange?: (value: FirestoreMap) => void;
}> = ({ onChange }) => {
  const state = useDocumentState();

  useEffect(() => {
    onChange && onChange(state);
  }, [onChange, state]);

  return (
    <>
      {Object.keys(state).map(field => (
        <NestedEditor key={field} path={[field]} />
      ))}
    </>
  );
};

/**
 * Field with call-to-actions for editing as well as rendering applicable child-nodes
 */
const NestedEditor: React.FC<{ path: string[] }> = ({ path }) => {
  const state = useFieldState(path);
  const dispatch = useDocumentDispatch()!;

  let childEditors = null;
  if (isMap(state)) {
    childEditors = Object.keys(state).map(childLeaf => {
      const childPath = [...path, childLeaf];
      return <NestedEditor key={childLeaf} path={childPath} />;
    });
  } else if (isArray(state)) {
    childEditors = state.map((value, index) => {
      const childPath = [...path, `${index}`];
      return <NestedEditor key={index} path={childPath} />;
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

  return (
    <>
      <div style={{ display: 'flex' }}>
        <TextField readOnly value={lastFieldName(path)} placeholder="Field" />
        <TextField readOnly value={getFieldType(state)} placeholder="Type" />
        {fieldEditor}
      </div>
      {childEditors && <div>{childEditors}</div>}
    </>
  );
};

export default DocumentEditor;
