import produce from 'immer';
import { Action, createReducer } from 'typesafe-actions';

import { AuthState, AuthUser } from '../../components/Auth/types';
import { getUniqueId } from '../../components/Firestore/DocumentEditor/utils';
import * as authActions from './actions';

const INIT_STATE = { users: [], filter: '' };

export const authReducer = createReducer<AuthState, Action>(INIT_STATE)
  .handleAction(
    authActions.addUser,
    produce((draft, { payload }) => {
      draft.users.push({
        createdAt: new Date(),
        localId: getUniqueId().toString(),
        disabled: false,
        ...payload.user,
      });
    })
  )
  .handleAction(
    authActions.updateUser,
    produce((draft, { payload }) => {
      draft.users = draft.users.map((user: AuthUser) => {
        return user.localId === payload.localId
          ? { ...user, ...payload.user }
          : user;
      });
    })
  )
  .handleAction(
    authActions.clearAllData,
    produce(draft => {
      draft.users = [];
    })
  )
  .handleAction(
    authActions.setUserDisabled,
    produce((draft, { payload }) => {
      const user = draft.users.find(
        (u: AuthUser) => u.localId === payload.localId
      );
      if (user) {
        user.disabled = payload.disabled;
      }
    })
  )
  .handleAction(
    authActions.deleteUser,
    produce((draft, { payload }) => {
      draft.users = draft.users.filter(
        (u: AuthUser) => u.localId !== payload.localId
      );
    })
  )
  .handleAction(
    authActions.updateFilter,
    produce((draft, { payload: { filter } }) => {
      draft.filter = filter;
    })
  );
