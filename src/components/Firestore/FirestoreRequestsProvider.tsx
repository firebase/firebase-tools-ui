/**
 * Copyright 2021 Google LLC
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

import React, { useEffect, useState } from 'react';

import { useConfigOptional } from '../common/EmulatorConfigProvider';

interface FirestoreRequestsState {
  requests: unknown[]; // TODO
}

const firestoreRequestsContext = React.createContext<
  FirestoreRequestsState | undefined
>(undefined);

export const FirestoreRequestsProvider: React.FC = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const config = useConfigOptional()?.firestore;
  useEffect(() => {
    if (!config || !config.webSocketHost || !config.webSocketPort) {
      setRequests([]);
    } else {
      const wsUrl = new URL('ws://placeholder');
      wsUrl.host = config.webSocketHost;
      wsUrl.port = config.webSocketPort.toString();
      console.log(wsUrl); // TODO: Connect to WS.
    }
  }, [config, setRequests]);

  return (
    <firestoreRequestsContext.Provider value={{ requests }}>
      {children}
    </firestoreRequestsContext.Provider>
  );
};

export function useFirestoreRequests(): FirestoreRequestsState {
  const context = React.useContext(firestoreRequestsContext);
  if (context === undefined) {
    throw new Error(
      'useFirestoreRequests must be used within a <FirestoreRequestsProvider>'
    );
  }
  return context;
}
