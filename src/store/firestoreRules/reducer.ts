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

import produce from 'immer';
import { Action, createReducer } from 'typesafe-actions';

import { FirestoreRulesEvaluation } from '../../components/Firestore/Rules/rules_evaluation_result_model';
import * as actions from './actions';

export interface FirestoreRulesState {
  requestEvaluations: FirestoreRulesEvaluation[];
}

const INIT_STATE: FirestoreRulesState = { requestEvaluations: [] };

// const firestoreRulesStoreContext = React.createContext<{
//   store: FirestoreRulesState;
//   dispatch: React.Dispatch<any>;
// }>({ store: INIT_STATE, dispatch: () => {} });

export const firestoreRulesReducer = createReducer<FirestoreRulesState, Action>(
  INIT_STATE
).handleAction(actions.addRequestEvaluation, (state, { payload }) =>
  produce(state, draft => {
    console.log('dev: store: ', payload, [
      payload,
      ...draft.requestEvaluations,
    ]);
    draft.requestEvaluations = [payload, ...draft.requestEvaluations];
  })
);

// const storeReducer: React.Reducer<FirestoreRulesState, Action> = (state, action) => {
//   return (firestoreRulesReducer.handlers as any)[action.type](state, action);
// };

// export const FirestoreRulesStore: React.FC<{ initState?: FirestoreRulesState }> = ({
//   initState = INIT_STATE,
//   children,
// }) => {
//   const [store, dispatch] = React.useReducer(storeReducer, initState);
//   return (
//     <firestoreRulesStoreContext.Provider value={{ store, dispatch }}>
//       {children}
//     </firestoreRulesStoreContext.Provider>
//   );
// };

// export function useFirestoreRulesStore(): {
//   store: FirestoreRulesState;
//   dispatch: React.Dispatch<Action>;
// } {
//   const context = React.useContext(firestoreRulesStoreContext);
//   if (context === undefined) {
//     throw new Error(
//       'useFirestoreRulesStore must be used within a <FirestoreRulesStore>'
//     );
//   }
//   return context;
// }

// export function useStore(): FirestoreRulesState {
//   const { store } = useFirestoreRulesStore();
//   return React.useMemo(() => store, [store]);
// }

// export function useDispatch(): React.Dispatch<Action> {
//   const { dispatch } = useFirestoreRulesStore();
//   return React.useMemo(() => dispatch, [dispatch]);
// }

// export function useEvaluationRequests(): FirestoreRulesEvaluation[] {
//   const { store } = useFirestoreRulesStore();
//   return store.requestEvaluations;
// }

// export function useEvaluationRequest(
//   evaluationId: string
// ): FirestoreRulesEvaluation | undefined {
//   const { store } = useFirestoreRulesStore();
//   return store.requestEvaluations?.find(
//     evaluation => evaluation.evaluationId === evaluationId
//   );
// }
