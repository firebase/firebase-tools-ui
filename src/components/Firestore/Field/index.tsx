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

import React, { useState, Provider } from 'react';
import produce from 'immer';
import { firestore } from 'firebase';
import { IconButton } from '@rmwc/icon-button';
import { ListItem, ListItemMeta } from '@rmwc/list';

import { getFieldType } from './utils';
import { useDocumentRef } from './DocumentRefContext';

import { FieldType } from './models';

import './index.scss';

const INITIAL_STATE: FieldFoo[] = [];

const DocumentStateContext = React.createContext(INITIAL_STATE);
const DocumentDispatchContext = React.createContext<React.Dispatch<any> | null>(
  null
);

const fieldReducer = produce((draft: FieldFoo[], action: any) => {
  switch (action.type) {
    case 'increment': {
      break;
    }
    case 'delete': {
      const parentField = draft.find(f => f.childIds.includes(action.id))!;
      parentField.childIds.splice(
        parentField.childIds.findIndex(f => f === action.id),
        1
      );
      break;
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
});

function countReducer(state: FieldFoo[], action: any): FieldFoo[] {
  switch (action.type) {
    case 'increment': {
      return state;
    }
    case 'delete': {
      return state;
      // const newState = [...state];
      // const parentField = newState.find((f) => f.childIds.includes(action.id))!;
      // parentField.childIds = [];
      // console.log(parentField);
      // return newState.filter((f) => f.id != action.id);
      // return produce(state, draftState => {
      //   const parentField = newState.find((f) => f.childIds.includes(action.id))!;
      //   return draftState.filter();
      //
      // })
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function useDocumentState() {
  const context = React.useContext(DocumentStateContext);
  if (context === undefined) {
    throw new Error('useCountState must be used within a CountProvider');
  }
  return context;
}

function useDocumentDispatch() {
  const context = React.useContext(DocumentDispatchContext);
  if (context === undefined) {
    throw new Error('useCountState must be used within a CountProvider');
  }
  return context;
}

function makeIdGenerator() {
  let counter = 1;
  return () => counter++;
}

/** Utility for generating unique ids for normalized state objects. */
const getUniqueId: () => number = makeIdGenerator();

interface FieldFoo {
  id: number;
  name?: string;
  value?: any;
  childIds: number[];
  isRoot: boolean;
}

function makeField({
  name,
  value,
  childIds = [],
  isRoot = false,
}: {
  name?: string;
  value?: any;
  childIds?: number[];
  isRoot?: boolean;
}): FieldFoo {
  return {
    id: getUniqueId(),
    name,
    value,
    childIds,
    isRoot,
  };
}

interface FieldFooBar extends FieldFoo {
  parentId?: number;
}

function reduceToFields(
  data: any,
  parentId?: number,
  name?: string,
  isRoot = false
): FieldFooBar[] {
  const fieldType = getFieldType(data);

  if (fieldType === FieldType.MAP) {
    const field = makeField({ name, isRoot });
    const childFields = Object.entries(data).reduce(
      (acc, [foo, value]) => {
        const childFields = reduceToFields(value, field.id, foo);
        return [...acc, ...childFields];
      },
      [] as FieldFooBar[]
    );

    const childIds = childFields.map(f => f.id);
    return [{ parentId, ...field }, ...childFields];
  }

  if (fieldType === FieldType.ARRAY) {
    const field = makeField({ name, isRoot });
    const childFields = data.reduce(
      (acc: FieldFooBar[], value: any) => {
        const childFields = reduceToFields(value, field.id);
        return [...acc, ...childFields] as FieldFooBar[];
      },
      [] as FieldFoo[]
    );

    const childIds = childFields.map((f: FieldFooBar) => f.id);
    return [{ parentId, ...field }, ...childFields];
  }

  return [
    {
      parentId,
      ...makeField({
        name,
        value: data,
        isRoot,
      }),
    },
  ] as FieldFooBar[];
}

export const RootField: React.FC<{ data: any }> = ({ data }) => {
  const state = reduceToFields(data, undefined, undefined, true);

  const realState = state.reduce(
    (acc, value) => {
      const { parentId, ...other } = value;
      return [
        ...acc,
        {
          ...other,
          childIds: state.filter(f => f.parentId === other.id).map(f => f.id),
        },
      ];
    },
    [] as FieldFoo[]
  );

  const [foo, dispatch] = React.useReducer(fieldReducer, realState);

  return (
    <DocumentStateContext.Provider value={foo}>
      <DocumentDispatchContext.Provider value={dispatch}>
        <RealRootField />
      </DocumentDispatchContext.Provider>
    </DocumentStateContext.Provider>
  );
};

export const RealRootField: React.FC = () => {
  const state = useDocumentState();

  const root = getRoot(state);
  const rootChildren = getFieldsByIds(state, root.childIds);

  return (
    <>
      {rootChildren.map(foo => (
        <Field key={foo.id} foo={foo} />
      ))}
    </>
  );
};

function getRoot(state: FieldFoo[]) {
  return state.find(f => f.isRoot)!;
}

function getFieldsByIds(state: FieldFoo[], ids: number[]) {
  return state.filter(f => ids.includes(f.id));
}

export const Field: React.FC<{
  foo: FieldFoo;
}> = ({ foo }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  // const reference = useDocumentRef();
  const state = useDocumentState();
  const dispatch = useDocumentDispatch()!;

  function handleDeleteField(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    dispatch({ type: 'delete', id: foo.id });
    // reference.update({ [id]: firestore.FieldValue.delete() });
  }

  const childFields = getFieldsByIds(state, foo.childIds);

  function handleExpandToggle() {
    setIsExpanded(!isExpanded);
  }

  return (
    <>
      <ListItem onClick={handleExpandToggle}>
        {foo.name}:
        {(foo.value && foo.value.toString()) ||
          (!isExpanded &&
            childFields &&
            JSON.stringify(childFields.map(f => f.name)))}
        <ListItemMeta className="Firestore-Field-actions">
          <IconButton
            icon="delete"
            label="Remove field"
            onClick={handleDeleteField}
          />
        </ListItemMeta>
      </ListItem>
      {isExpanded && childFields.map(f => <Field key={f.id} foo={f} />)}
    </>
  );
};
