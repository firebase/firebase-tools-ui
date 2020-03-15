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
import { firestore } from 'firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import get from 'lodash.get';
import produce from 'immer';
import { Action, createReducer } from 'typesafe-actions';

import { isMap, isArray, getLeafPath, getParentPath } from './utils';
import { FirestoreArray, FirestoreAny, FirestoreMap } from './models';
import * as actions from './actions';

const createLiveReducer = (
  documentRef: firestore.DocumentReference,
  data: FirestoreMap
) =>
  createReducer<FirestoreMap, Action>({})
    .handleAction(actions.reset, (state, { payload }) => {
      return payload;
    })
    .handleAction(
      actions.addField,
      produce((draft, { payload }) => {
        //const parent = get(draft, getParentPath(payload.path)) || draft;
        //if (isMap(parent)) {
        //  parent[getLeafPath(payload.path)] = payload.value;
        //} else if (isArray(parent)) {
        //  parent.push(payload.value);
        //}

        const newPayload = adjustPayloadForArray(
          data,
          payload.path,
          payload.value
        );
        documentRef.update(newPayload);
        return draft;
      })
    )
    .handleAction(
      actions.updateField,
      produce((draft, { payload }) => {
        const newPayload = adjustPayloadForArray(
          data,
          payload.path,
          payload.value
        );
        documentRef.update(newPayload);
        return draft;
      })
    )
    .handleAction(actions.deleteField, (draft, { payload }) => {
      const newPayload = adjustPayloadForArray(
        data,
        payload,
        firestore.FieldValue.delete()
      );
      documentRef.update(newPayload);
      return draft;
    });

/**
 * Firestore does not allow array syntax when updating/deleting fields i.e.
 * .update('obj.array[2]', true)
 *
 * This normalizes a payload's `objectPath` and `updateValue` into a form
 * that writes to the top most array with a reconstructed payload contains the
 * updated (or deleted) value.
 */
function adjustPayloadForArray(
  doc: FirestoreMap,
  fieldPath: string[],
  value: FirestoreAny | firestore.FieldValue
): FirestoreMap {
  console.log('adjust', doc, fieldPath, value);
  if (fieldPath.length === 1) {
    return { [fieldPath[0]]: value };
  }

  let nestedObjectToModify: FirestoreMap | FirestoreArray = doc;
  let topLevelArray: FirestoreArray | undefined = undefined;
  let topLevelKey: string[] = [];
  fieldPath.slice(0, -1).forEach((pathSegment, index) => {
    // console.log({ nestedObjectToModify, pathSegment });
    if (isMap(nestedObjectToModify)) {
      nestedObjectToModify = nestedObjectToModify[pathSegment] as FirestoreMap;
    } else if (isArray(nestedObjectToModify)) {
      nestedObjectToModify = nestedObjectToModify[
        parseInt(pathSegment)
      ] as FirestoreMap;
    }
    if (nestedObjectToModify instanceof Array && !topLevelArray) {
      topLevelArray = nestedObjectToModify;
      topLevelKey = fieldPath.slice(0, index + 1);
    }
  });

  console.log({ topLevelArray, topLevelKey });

  // If no array was found, carry on as usual
  if (!topLevelArray) {
    return { [fieldPath.join('.')]: value };
  }

  const nestedFieldId = fieldPath[fieldPath.length - 1];
  console.log({ value });
  if (value !== firestore.FieldValue.delete()) {
    console.log('value is not delete');
    // Example:
    // {
    //   foo: [             <-- foo == topLevelArray
    //     {
    //       bar: {         <-- bar == nestedObjectToModify
    //         baz: 'test'  <-- 'baz' == nestedFieldId
    //       }
    //     }
    //   ]
    // }

    if (topLevelArray === nestedObjectToModify) {
      console.log('arrayUnion', { topLevelKey, fieldPath, value });
      return {
        [topLevelKey.join('.')]: firestore.FieldValue.arrayUnion(value),
      };
    }
    nestedObjectToModify[nestedFieldId] = value;
  } else {
    // Deal with deleting from an array
    if (nestedObjectToModify instanceof Array) {
      console.log('nested object is an array');
      console.log(nestedObjectToModify === topLevelArray);
      if (nestedObjectToModify !== topLevelArray) {
        nestedObjectToModify.splice(Number(nestedFieldId), 1);
        return { [topLevelKey.join('.')]: topLevelArray };
      }
      // In this case we are modifying the array itself
      // Example:
      // {
      //   foo: [  <-- foo == topLevelArray, nestedObjectToModify
      //     'a',
      //     'b',  <-- 1 == nestedFieldId (index, to be deleted)
      //     'c',
      //   ]
      // }

      // nestedObjectToModify.splice(Number(nestedFieldId), 1);
      return {
        [topLevelKey.join('.')]: firestore.FieldValue.arrayRemove(
          nestedObjectToModify[Number(nestedFieldId)]
        ),
      };
    } else {
      console.log('nested object is a decendant of array');
      // Otherwise, we are modifying a descendant of the array
      // Example:
      // {
      //   foo: [            <-- foo == topLevelArray
      //     'a',
      //     'b',
      //     {
      //       bar: {        <-- bar == nestedObjectToModify
      //         baz: 'qux'  <-- 'baz' == nestedFieldId (to be deleted)
      //       }
      //     }
      //   ]
      // }
      delete nestedObjectToModify[nestedFieldId];
    }
  }

  console.log({ topLevelKey, topLevelArray });

  return { [topLevelKey.join('.')]: topLevelArray };
}

const reducer = createReducer<FirestoreMap, Action>({})
  .handleAction(actions.reset, (state, { payload }) => {
    return payload;
  })
  .handleAction(
    actions.addField,
    produce((draft, { payload }) => {
      const parent = get(draft, getParentPath(payload.path)) || draft;
      if (isMap(parent)) {
        parent[getLeafPath(payload.path)] = payload.value;
      } else if (isArray(parent)) {
        parent.push(payload.value);
      }
    })
  )
  .handleAction(
    actions.updateField,
    produce((draft, { payload }) => {
      const parent = get(draft, getParentPath(payload.path)) || draft;
      if (isMap(parent)) {
        parent[getLeafPath(payload.path)] = payload.value;
      } else if (isArray(parent)) {
        parent[parseInt(getLeafPath(payload.path))] = payload.value;
      } else {
        return payload.value;
      }
    })
  )
  .handleAction(
    actions.deleteField,
    produce((draft, { payload }) => {
      const parent = get(draft, getParentPath(payload)) || draft;
      if (isMap(parent)) {
        delete parent[getLeafPath(payload)];
      } else if (isArray(parent)) {
        parent.splice(parseInt(getLeafPath(payload)), 1);
      }
    })
  );

export const DocumentStateContext = React.createContext<FirestoreMap>({});
const DocumentDispatchContext = React.createContext<React.Dispatch<
  Action
> | null>(null);

export function useDocumentState(): FirestoreMap {
  const context = React.useContext(DocumentStateContext);
  if (context === undefined) {
    throw new Error('useDocumentState must be used within a DocumentProvider');
  }
  return context;
}

export function useDocumentDispatch() {
  const context = React.useContext(DocumentDispatchContext);
  if (context === undefined) {
    throw new Error(
      'useDocumentDispatch must be used within a DocumentProvider'
    );
  }
  return context;
}

export function useFieldState(path: string[]): FirestoreAny {
  const documentState = useDocumentState();
  if (path.length === 0) return documentState;
  return get(documentState, path) || '';
}

export const DocumentProvider: React.FC<{ value: FirestoreMap }> = ({
  value = {},
  children,
}) => {
  const [state, dispatch] = React.useReducer(reducer, value);

  return (
    <DocumentStateContext.Provider value={state}>
      <DocumentDispatchContext.Provider value={dispatch}>
        {children}
      </DocumentDispatchContext.Provider>
    </DocumentStateContext.Provider>
  );
};

export const DocumentRefProvider: React.FC<{
  documentRef: firestore.DocumentReference;
  value: FirestoreMap;
}> = ({ value, documentRef, children }) => {
  const [doc, loading, error] = useDocumentData(documentRef);
  const [state, dispatch] = React.useReducer(
    createLiveReducer(documentRef, doc as FirestoreMap),
    {}
  );

  useEffect(() => {
    dispatch(actions.reset(value));
  }, [value]);

  return (
    <DocumentStateContext.Provider value={state}>
      <DocumentDispatchContext.Provider value={dispatch}>
        {children}
      </DocumentDispatchContext.Provider>
    </DocumentStateContext.Provider>
  );
};
