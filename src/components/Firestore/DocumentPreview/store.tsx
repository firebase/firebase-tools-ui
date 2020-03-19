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

import get from 'lodash.get';
import React from 'react';

import { FirestoreAny, FirestoreMap } from '../models';

const DocumentStateContext = React.createContext<FirestoreMap>({});

export const DocumentProvider: React.FC<{
  value: FirestoreMap;
}> = ({ value, children }) => {
  return (
    <DocumentStateContext.Provider value={value}>
      {children}
    </DocumentStateContext.Provider>
  );
};

export function useDocumentState(): FirestoreMap {
  const context = React.useContext(DocumentStateContext);
  if (context === undefined) {
    throw new Error('useDocumentState must be used within a DocumentProvider');
  }
  return context;
}

export function useFieldState(path: string[]): FirestoreAny {
  const documentState = useDocumentState();
  if (path.length === 0) return documentState;
  return get(documentState, path);
}
