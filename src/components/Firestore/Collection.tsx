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

import React from 'react';
import { firestore } from 'firebase';
import { Route, useRouteMatch, NavLink } from 'react-router-dom';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Icon } from '@rmwc/icon';
import { List, ListItem } from '@rmwc/list';

import { Document } from './Document';
import PanelHeader from './PanelHeader';

import './index.scss';

export interface Props {
  collection: firestore.CollectionReference;
}

export const Collection: React.FC<Props> = ({ collection }) => {
  const [collectionSnapshot, loading, error] = useCollection(collection);
  const { url } = useRouteMatch()!;

  if (loading) return <></>;
  if (error) return <></>;

  // TODO: Fetch missing documents (i.e. nonexistent docs with subcollections).
  const docs = collectionSnapshot ? collectionSnapshot.docs : [];

  return (
    <>
      <div className="Firestore-Collection">
        <PanelHeader
          id={collection.id}
          icon={<Icon icon="collections_bookmark" />}
        />

        <List dense>
          <ListItem disabled>Add document +</ListItem>
          {docs.map(doc => (
            <ListItem
              key={doc.ref.id}
              tag={props => (
                <NavLink
                  to={`${url}/${doc.ref.id}`}
                  activeClassName="mdc-list-item--activated"
                  {...props}
                />
              )}
            >
              {doc.ref.id}
            </ListItem>
          ))}
        </List>
      </div>
      <Route
        path={`${url}/:id`}
        render={({ match }: any) => {
          const docRef = collection.doc(match.params.id);

          if (!docRef) {
            // TODO what about a missing doc
            return <></>;
          }

          return <Document reference={docRef} />;
        }}
      ></Route>
    </>
  );
};

export default Collection;
