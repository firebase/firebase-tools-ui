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

import { createContext, useContext } from 'react';
import { firestore } from 'firebase';

const DocumentRefContext = createContext<firestore.DocumentReference | null>(
  null
);

export const DocumentRefProvider = DocumentRefContext.Provider;
export const useDocumentRef = () => {
  const documentRef = useContext(DocumentRefContext);
  if (!documentRef) {
    throw new Error('You are missing a <DocumentRefProvider>.');
  }
  return documentRef;
};
