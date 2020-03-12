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
import { List, ListItem } from '@rmwc/list';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { RootField, Field } from './Field';
import { DocumentRefProvider } from './Field/DocumentRefContext';

export interface Props {
  reference: firestore.DocumentReference;
}

export const DocumentPreview: React.FC<Props> = ({ reference }) => {
  const [data, loading, error] = useDocumentData(reference);

  if (loading) return <div>Loading document...</div>;
  if (error) return <div>Error retrieving document</div>;

  return (
    <DocumentRefProvider value={reference}>
      <List dense>
        <ListItem disabled>Add field +</ListItem>
        <RootField data={data} />
        {/*data &&
          Object.entries(data).map(([key, value]) => (
            <Field key={key} id={key} value={value} />
            ))*/}
      </List>
    </DocumentRefProvider>
  );
};

export default DocumentPreview;
