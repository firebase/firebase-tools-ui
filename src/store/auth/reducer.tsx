/**
 * Copyright 2023 Google LLC
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

import { AuthState, AuthUser } from '../../components/Auth/types';
import { mapResult } from '../utils';
import * as authActions from './actions';

const INIT_STATE = {
  users: { loading: true },
  filter: '',
  allowDuplicateEmails: false,
  customAuthActionUri: '',
  tenants: { loading: true },
  alertText: '',
};

export const authReducer = createReducer<AuthState, Action>(INIT_STATE)
  .handleAction(authActions.createUserSuccess, (state, { payload }) => {
    return produce(state, (draft) => {
      draft.users = mapResult(draft.users, (users: AuthUser[]) => [
        ...users,
        payload.user,
      ]);
      draft.alertText = ''; // TODO(abradham): Consider alerting on "User Created"
    });
  })
  .handleAction(authActions.updateUserSuccess, (state, { payload }) => {
    return produce(state, (draft) => {
      draft.users = mapResult(draft.users, (users) =>
        users.map((user: AuthUser) => {
          return user.localId === payload.user.localId ? payload.user : user;
        })
      );
    });
  })
  .handleAction(authActions.nukeUsersSuccess, (state) => {
    return produce(state, (draft) => {
      draft.users = mapResult(draft.users, () => []);
      draft.alertText = 'All Users Cleared!';
    });
  })
  .handleAction(authActions.nukeUsersForAllTenantsSuccess, (state) => {
    return produce(state, (draft) => {
      draft.users = mapResult(draft.users, () => []);
      draft.alertText = 'All Users Cleared!';
    });
  })
  .handleAction(
    authActions.setAllowDuplicateEmailsSuccess,
    (state, { payload }) => {
      return produce(state, (draft) => {
        draft.allowDuplicateEmails = payload;
      });
    }
  )
  .handleAction(
    authActions.setCustomAuthActionUriSuccess,
    (state, { payload }) => {
      return produce(state, (draft) => {
        draft.customAuthActionUri = payload;
      });
    }
  )
  .handleAction(authActions.setUserDisabledSuccess, (state, { payload }) => {
    return produce(state, (draft) => {
      draft.users = mapResult(draft.users, (users: AuthUser[]) => {
        return users.map((u: AuthUser) =>
          u.localId === payload.localId
            ? { ...u, disabled: payload.disabled }
            : u
        );
      });
    });
  })
  .handleAction(authActions.deleteUserSuccess, (state, { payload }) => {
    return produce(state, (draft) => {
      draft.users = mapResult(draft.users, (users: AuthUser[]) =>
        users.filter((u: AuthUser) => u.localId !== payload.localId)
      );
    });
  })
  .handleAction(authActions.updateFilter, (state, { payload }) => {
    return produce(state, (draft) => {
      draft.filter = payload.filter;
    });
  })
  .handleAction(authActions.openAuthUserDialog, (state, { payload }) => {
    return produce(state, (draft) => {
      draft.authUserDialogData = payload;
    });
  })
  .handleAction(authActions.setAuthUserDialogLoading, (state, { payload }) => {
    return produce(state, (draft) => {
      if (draft.authUserDialogData) {
        draft.authUserDialogData.loading = payload;
      }
    });
  })
  .handleAction(authActions.setAuthUserDialogError, (state, { payload }) => {
    return produce(state, (draft) => {
      if (draft.authUserDialogData && draft.authUserDialogData.result) {
        (draft.authUserDialogData.result as any).error = payload;
      }
    });
  })
  .handleAction(authActions.clearAuthUserDialogData, (state) => {
    return produce(state, (draft) => {
      draft.authUserDialogData = undefined;
    });
  })
  .handleAction(authActions.authFetchUsersSuccess, (state, { payload }) => {
    return produce(state, (draft) => {
      draft.users = {
        loading: false,
        result: { data: payload },
      };
      draft.alertText = '';
    });
  })
  .handleAction(authActions.authFetchUsersError, (state, { payload }) => {
    return produce(state, (draft) => {
      draft.users = {
        loading: false,
        result: { error: payload },
      };
    });
  })
  .handleAction(authActions.authFetchTenantsSuccess, (state, { payload }) => {
    return produce(state, (draft) => {
      draft.tenants = {
        loading: false,
        result: { data: payload },
      };
    });
  })
  .handleAction(authActions.authFetchTenantsRequest, (state) => {
    return produce(state, (draft) => {
      // intentionally don't wipe out the old tenants list
      // so that components that rely on tenants list don't flicker
      draft.tenants.loading = true;
    });
  });
