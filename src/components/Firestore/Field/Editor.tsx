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

import React, { useEffect, useState, Provider } from 'react';
import _ from 'lodash';
import produce from 'immer';
import { firestore } from 'firebase';
import { Card, CardActionButtons, CardActionButton } from '@rmwc/card';
import { Elevation } from '@rmwc/elevation';
import { IconButton } from '@rmwc/icon-button';
import { ListItem, ListItemMeta } from '@rmwc/list';
import { TextField } from '@rmwc/textfield';

import { getLeafPath, getFieldType } from './utils';

import { FieldType } from './models';
import {
  useDocumentState,
  useDocumentDispatch,
  useFieldState,
  DocumentProvider,
} from './DocumentStore';

export const Editor: React.FC<{
  data: any;
  onChange: (data: any) => void;
}> = ({ data, onChange }) => {
  return (
    <DocumentProvider data={data}>
      <RootField onChange={onChange} />
    </DocumentProvider>
  );
};

const RootField: React.FC<{ onChange: (data: any) => void }> = ({
  onChange,
}) => {
  const state = useDocumentState();

  useEffect(() => {
    onChange(state);
  }, [state]);

  return <NestedEditor path={[]} />;
};

const NestedEditor: React.FC<{ path: string[] }> = ({ path }) => {
  const documentState = useDocumentState();
  const state = useFieldState(path);
  const dispatch = useDocumentDispatch()!;

  const fieldType = getFieldType(state);

  let childFields = null;
  if (fieldType === FieldType.MAP) {
    childFields = Object.keys(state).map(childLeaf => {
      const childPath = [...path, childLeaf];
      return <NestedEditor key={childLeaf} path={childPath} />;
    });
  } else if (fieldType === FieldType.ARRAY) {
    childFields = state.map((value: any, index: number) => {
      const childPath = [...path, `${index}`];
      return <NestedEditor key={index} path={childPath} />;
    });
  }

  function handleEditValue(e: React.FormEvent<HTMLInputElement>) {
    console.log('update', path, e.currentTarget.value);
    dispatch({ type: 'update', path, value: e.currentTarget.value });
  }

  return (
    <>
      <div style={{ display: 'flex' }}>
        <TextField readOnly value={getLeafPath(path)} />
        <TextField readOnly value={fieldType} />
        <TextField value={state} onChange={handleEditValue} />
      </div>
      {childFields && <div>{childFields}</div>}
    </>
  );
};
