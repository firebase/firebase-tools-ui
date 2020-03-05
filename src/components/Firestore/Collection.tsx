/**
 * Copyright 2019 Google LLC
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

import { Route, useRouteMatch, Link } from 'react-router-dom';
import React, { useReducer, useEffect } from 'react';
import './index.scss';
import { firestore } from 'firebase';
import { Document } from './Document';
import { Typography } from '@rmwc/typography';
import { Icon } from '@rmwc/icon';

export interface Props {
  collection: firestore.CollectionReference;
}

export interface CollectionState {
  isLoading: boolean;
  documents: DocumentWrapper[];
}

export interface DocumentWrapper {
  ref: firestore.DocumentReference;

  // Missing if the document is a "missing document".
  snapshot?: firestore.DocumentSnapshot;
}

export type CollectionAction =
  | { type: 'DOCUMENTS_LOADING' }
  | { type: 'DOCUMENTS_UPDATED'; documents: DocumentWrapper[] };

export function reducer(
  state: CollectionState,
  action: CollectionAction
): CollectionState {
  switch (action.type) {
    case 'DOCUMENTS_UPDATED':
      return { ...state, isLoading: false, documents: action.documents };
    case 'DOCUMENTS_LOADING':
      return { ...state, isLoading: true, documents: [] };
  }
  // TODO
  return state;
}

export function useCollection(
  collection: firestore.CollectionReference
): [CollectionState, (action: CollectionAction) => void] {
  const [state, dispatch] = useReducer(reducer, {
    isLoading: false,
    documents: [],
  });
  useEffect(() => {
    dispatch({ type: 'DOCUMENTS_LOADING' });
    // TODO: what happens with missing docs?
    const cancel = collection.onSnapshot(snap => {
      const documents = snap.docs.map(doc => ({
        snapshot: doc,
        ref: doc.ref,
      }));
      dispatch({ type: 'DOCUMENTS_UPDATED', documents });
    });
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection.path]);
  return [state, dispatch];
}

export const Collection: React.FC<Props> = ({ collection }) => {
  const [state] = useCollection(collection);

  let { url } = useRouteMatch()!;

  return (
    <>
      <div className="Firestore-Collection">
        <div>
          <Typography use="body1" aria-label="Key name">
            <Icon icon="collections_bookmark" /> {collection.id}
          </Typography>
        </div>

        <div>
          {state.isLoading ? (
            <p>Loading documents...</p>
          ) : (
            <div>
              <ul>
                {state.documents.map(doc => (
                  <li key={doc.ref.id}>
                    <Link to={`${url}/${doc.ref.id}`}>{doc.ref.id}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <Route
        path={`${url}/:id`}
        render={({ match }: any) => {
          // TODO: what happens with missing docs?
          const doc = state.documents.find(d => d.ref.id === match.params.id);

          if (!doc) {
            return <p>Loading document...</p>;
          }

          return <Document reference={doc.ref} />;
        }}
      ></Route>
    </>
  );
};

export default Collection;
