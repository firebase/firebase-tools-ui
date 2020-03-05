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
import { useDocumentData } from 'react-firebase-hooks/firestore';

export interface Props {
  reference: firestore.DocumentReference;
}

export const DocumentPreview: React.FC<Props> = ({ reference }) => {
  const [data, loading, error] = useDocumentData(reference);

  if (loading) return <div>Loading document...</div>;
  if (error) return <div>Error retrieving document</div>;
  return <div>test {JSON.stringify(data)}</div>;
};

export default DocumentPreview;
