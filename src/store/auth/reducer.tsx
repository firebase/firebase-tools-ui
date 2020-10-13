import produce from 'immer';
import { Action, createReducer } from 'typesafe-actions';

import { AuthState, AuthUser } from '../../components/Auth/types';
import { getUniqueId } from '../../components/Firestore/DocumentEditor/utils';
import { mapResult } from '../utils';
import * as authActions from './actions';

const INIT_STATE = {
  users: { loading: true },
  filter: '',
  allowDuplicateEmails: false,
};

export const authReducer = createReducer<AuthState, Action>(INIT_STATE)
  .handleAction(
    authActions.createUserSuccess,
    produce((draft, { payload }) => {
      draft.users = mapResult(draft.users, (users: AuthUser[]) => [
        ...users,
        {
          createdAt: new Date().getTime().toString(),
          lastLoginAt: new Date().getTime().toString(),
          localId: getUniqueId().toString(),
          disabled: false,
          ...payload.user,
        },
      ]);
    })
  )
  .handleAction(
    authActions.updateUserSuccess,
    produce((draft: AuthState, { payload }) => {
      draft.users = mapResult(draft.users, users =>
        users.map((user: AuthUser) => {
          return user.localId === payload.user.localId
            ? { ...user, ...payload.user }
            : user;
        })
      );
    })
  )
  .handleAction(
    authActions.nukeUsersSuccess,
    produce(draft => {
      draft.users = mapResult(draft.users, () => []);
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
      draft.users = mapResult(draft.users, (users: AuthUser[]) => {
        return users.map((u: AuthUser) =>
          u.localId === payload.localId
            ? { ...u, disabled: payload.disabled }
            : u
        );
      });
    })
  )
  .handleAction(
    authActions.deleteUserSuccess,
    produce((draft, { payload }) => {
      draft.users = mapResult(draft.users, (users: AuthUser[]) =>
        users.filter((u: AuthUser) => u.localId !== payload.localId)
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
    authActions.openAuthUserDialog,
    produce((draft, { payload: authUserDialogData }) => {
      draft.authUserDialogData = authUserDialogData;
    })
  )
  .handleAction(
    authActions.setAuthUserDialogLoading,
    produce((draft, { payload: loading }) => {
      if (draft.authUserDialogData) {
        draft.authUserDialogData.loading = loading;
      }
    })
  )
  .handleAction(
    authActions.setAuthUserDialogError,
    produce((draft, { payload: error }) => {
      if (draft.authUserDialogData && draft.authUserDialogData.result) {
        draft.authUserDialogData.result.error = error;
      }
    })
  )
  .handleAction(
    authActions.clearAuthUserDialogData,
    produce(draft => {
      draft.authUserDialogData = undefined;
    })
  )
  .handleAction(
    authActions.authFetchUsersSuccess,
    produce((draft: AuthState, { payload }) => {
      draft.users = {
        loading: false,
        result: { data: payload },
      };
    })
  )
  .handleAction(
    authActions.authFetchUsersError,
    produce((draft: AuthState, { payload }) => {
      draft.users = {
        loading: false,
        result: { error: payload },
      };
    })
  );
