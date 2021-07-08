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
import {
  useConfigOptional,
  useEmulatorConfig,
  useOnChangePromise,
} from '../../common/EmulatorConfigProvider';
import { FirestoreRulesEvaluation } from './rules_evaluation_result_model';

interface FirestoreRequestsState {
  requests?: FirestoreRulesEvaluation[];
  promise?: Promise<void>;
  isRequestsAvailable?: boolean;
}

const firestoreRequestsContext = React.createContext<
  FirestoreRequestsState | undefined
>(undefined);

export const FirestoreRequestsProvider: React.FC = ({ children }) => {
  const [requests, setRequests] = useState<FirestoreRulesEvaluation[]>();
  const config = useConfigOptional();
  const projectId = config?.projectId;
  const firestore = config?.firestore;
  useEffect(() => {
    if (
      !projectId ||
      !firestore ||
      !firestore.webSocketHost ||
      !firestore.webSocketPort
    ) {
      setRequests(undefined);
    } else {
      const wsUrl = new URL('ws://placeholder/requests');
      wsUrl.host = firestore.webSocketHost;
      wsUrl.port = firestore.webSocketPort.toString();

      const webSocket = new ReconnectingWebSocket(wsUrl.toString());
      webSocket.listener = (
        newEvaluation: FirestoreRulesEvaluation | FirestoreRulesEvaluation[]
      ) => {
        if (newEvaluation instanceof Array) {
          // This is the initial "blast" of prior requests
          setRequests(newEvaluation.filter(isCurrentProject));
        } else if (isCurrentProject(newEvaluation)) {
          setRequests((requests) => [...(requests || []), newEvaluation]);
        }
      };

      return () => webSocket.cleanup();
    }

    function isCurrentProject(evaluation: FirestoreRulesEvaluation): boolean {
      if (!evaluation.rulesReleaseName) {
        // Old versions of Firestore Emulator does not send this field.
        return true; // Let's assume the same project and hope for the best.
      }
      return evaluation.rulesReleaseName.startsWith(`projects/${projectId}/`);
    }
  }, [projectId, firestore, setRequests]);
  const promise = useOnChangePromise(requests) as Promise<void>;

  return (
    <firestoreRequestsContext.Provider value={{ requests, promise }}>
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

export function useFirestoreRequests(): {
  requests: FirestoreRulesEvaluation[];
} {
  const context = React.useContext(firestoreRequestsContext);
  if (context === undefined) {
    throw new Error(
      'useFirestoreRequests must be used within a <FirestoreRequestsProvider>'
    );
  }
  if (!context.requests) {
    throw context.promise;
  }
  return { requests: context.requests };
}

export function useIsFirestoreRequestsAvailable(): boolean {
  const config = useEmulatorConfig('firestore');
  return !!(config.webSocketHost && config.webSocketPort);
}

export function useFirestoreRequest(
  requestId: string
): FirestoreRulesEvaluation | undefined {
  const { requests } = useFirestoreRequests();
  return requests.find((req) => req.requestId === requestId);
}
