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

import { ReconnectingWebSocket } from '../../../reconnectingWebSocket';
import { useConfigOptional } from '../../common/EmulatorConfigProvider';
import { FirestoreRulesEvaluation } from './rules_evaluation_result_model';

interface FirestoreRequestsState {
  requests: FirestoreRulesEvaluation[];
}

const firestoreRequestsContext = React.createContext<
  FirestoreRequestsState | undefined
>(undefined);

export const FirestoreRequestsProvider: React.FC = ({ children }) => {
  const [requests, setRequests] = useState<FirestoreRulesEvaluation[]>([]);
  const config = useConfigOptional()?.firestore;
  useEffect(() => {
    if (!config || !config.webSocketHost || !config.webSocketPort) {
      setRequests([]);
    } else {
      const wsUrl = new URL('ws://placeholder/requests');
      wsUrl.host = config.webSocketHost;
      wsUrl.port = config.webSocketPort.toString();

      const webSocket = new ReconnectingWebSocket(wsUrl.toString());
      webSocket.listener = (
        newEvaluation: FirestoreRulesEvaluation | FirestoreRulesEvaluation[]
      ) => {
        if (newEvaluation instanceof Array) {
          // This is the initial "blast" of prior requests
          setRequests(newEvaluation);
        } else {
          setRequests((requests) => [...requests, newEvaluation]);
        }
      };
      return () => webSocket.cleanup();
    }
  }, [config, setRequests]);

  return (
    <firestoreRequestsContext.Provider value={{ requests }}>
      {children}
    </firestoreRequestsContext.Provider>
  );
};

export const TestFirestoreRequestsProvider: React.FC<{
  state: FirestoreRequestsState;
}> = ({ state, children }) => {
  return (
    <firestoreRequestsContext.Provider value={state}>
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

export function useFirestoreRequest(
  requestId: string
): FirestoreRulesEvaluation | undefined {
  const { requests } = useFirestoreRequests();
  return requests.find((req) => req.requestId === requestId);
}
