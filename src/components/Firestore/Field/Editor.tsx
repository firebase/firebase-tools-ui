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

import React, { useEffect } from 'react';
import { TextField } from '@rmwc/textfield';

import * as actions from './actions';
import {
  useDocumentState,
  useDocumentDispatch,
  useFieldState,
  DocumentProvider,
} from './DocumentStore';
import { FirestoreAny } from './models';
import { isMap, isArray, getLeafPath, getFieldType } from './utils';

/** Entry point for a Document/Field editor */
export const Editor: React.FC<{
  value: { [key: string]: FirestoreAny };
  onChange?: (value: FirestoreAny) => void;
  rootKey?: string;
}> = ({ value, onChange, rootKey }) => {
  return (
    <DocumentProvider value={value}>
      <RootField onChange={onChange} rootKey={rootKey} />
    </DocumentProvider>
  );
};

/**
 * Special representation of a Document Root, where we don't want to show
 * the implicit top-level map.
 *
 * TODO: need to differentiate between root-field and root-document for
 * Add-Document flow.
 */
const RootField: React.FC<{
  onChange?: (value: FirestoreAny) => void;
  rootKey?: string;
}> = ({ onChange, rootKey }) => {
  const state = useDocumentState();

  useEffect(() => {
    onChange && onChange(state);
  }, [onChange, state]);

  return <NestedEditor path={[]} rootKey={rootKey} />;
};

/**
 * Field with CTAs for editing as well as rendering applicable child-nodes
 */
const NestedEditor: React.FC<{ path: string[]; rootKey?: string }> = ({
  path,
  rootKey,
}) => {
  const state = useFieldState(path);
  const dispatch = useDocumentDispatch()!;

  let childFields = null;
  if (isMap(state)) {
    childFields = Object.keys(state).map(childLeaf => {
      const childPath = [...path, childLeaf];
      return <NestedEditor key={childLeaf} path={childPath} />;
    });
  } else if (isArray(state)) {
    childFields = state.map((value, index) => {
      const childPath = [...path, `${index}`];
      return <NestedEditor key={index} path={childPath} />;
    });
  }

  function handleEditValue(e: React.FormEvent<HTMLInputElement>) {
    dispatch(actions.updateField({ path, value: e.currentTarget.value }));
  }

  return (
    <>
      <div style={{ display: 'flex' }}>
        <TextField
          readOnly
          value={getLeafPath(path) || rootKey}
          placeholder="Field"
        />
        <TextField readOnly value={getFieldType(state)} placeholder="Type" />
        <TextField
          value={state}
          onChange={handleEditValue}
          placeholder="Value"
        />
      </div>
      {childFields && <div>{childFields}</div>}
    </>
  );
};
