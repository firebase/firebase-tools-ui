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
import { isMap, isArray, getLeafPath, getFieldType } from './utils';

export const Editor: React.FC<{
  data: any;
  onChange: (data: any) => void;
  rootKey?: string;
}> = ({ data, onChange, rootKey }) => {
  return (
    <DocumentProvider data={data}>
      <RootField onChange={onChange} rootKey={rootKey} />
    </DocumentProvider>
  );
};

const RootField: React.FC<{
  onChange: (data: any) => void;
  rootKey?: string;
}> = ({ onChange, rootKey }) => {
  const state = useDocumentState();

  useEffect(() => {
    onChange(state);
  }, [onChange, state]);

  return <NestedEditor path={[]} rootKey={rootKey} />;
};

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
        <TextField readOnly value={getLeafPath(path) || rootKey} />
        <TextField readOnly value={getFieldType(state)} />
        <TextField value={state} onChange={handleEditValue} />
      </div>
      {childFields && <div>{childFields}</div>}
    </>
  );
};
