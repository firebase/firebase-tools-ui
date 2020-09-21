import produce from 'immer';
import { Action, createReducer } from 'typesafe-actions';

import { AuthState, AuthUser } from '../../components/Auth/types';
import { getUniqueId } from '../../components/Firestore/DocumentEditor/utils';
import * as authActions from './actions';

const INIT_STATE = {
  users: [],
  filter: '',
  allowDuplicateEmails: false,
};

export const authReducer = createReducer<AuthState, Action>(INIT_STATE)
  .handleAction(
    authActions.createUserSuccess,
    produce((draft, { payload }) => {
      draft.users.push({
        createdAt: new Date().getTime().toString(),
        lastLoginAt: new Date().getTime().toString(),
        localId: getUniqueId().toString(),
        disabled: false,
        ...payload.user,
      });
    })
  )
  .handleAction(
    authActions.updateUserSuccess,
    produce((draft, { payload }) => {
      draft.users = draft.users.map((user: AuthUser) => {
        return user.localId === payload.user.localId
          ? { ...user, ...payload.user }
          : user;
      });
    })
  )
  .handleAction(
    authActions.nukeUsersSuccess,
    produce(draft => {
      draft.users = [];
    })
  )
  .handleAction(
    authActions.setAllowDuplicateEmailsSuccess,
    produce((draft, { payload }) => {
      draft.allowDuplicateEmails = payload;
    })
  )
  .handleAction(
    authActions.setUserDisabledSuccess,
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
    authActions.deleteUserSuccess,
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
  )
  .handleAction(
    authActions.authFetchUsersSuccess,
    produce((draft, { payload }) => {
      draft.users = payload;
    })
  );
