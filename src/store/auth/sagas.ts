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

import {
  all,
  call,
  getContext,
  put,
  setContext,
  takeLatest,
} from 'redux-saga/effects';
import { ActionType, getType } from 'typesafe-actions';

import AuthApi from '../../components/Auth/api';
import { AuthUser } from '../../components/Auth/types';
import {
  authFetchUsersError,
  authFetchUsersRequest,
  authFetchUsersSuccess,
  clearAuthUserDialogData,
  createUserRequest,
  createUserSuccess,
  deleteUserRequest,
  deleteUserSuccess,
  getAllowDuplicateEmailsRequest,
  nukeUsersRequest,
  nukeUsersSuccess,
  setAllowDuplicateEmailsRequest,
  setAllowDuplicateEmailsSuccess,
  setAuthUserDialogError,
  setAuthUserDialogLoading,
  setUserDisabledRequest,
  setUserDisabledSuccess,
  updateAuthConfig,
  updateUserRequest,
  updateUserSuccess,
} from './actions';

// TODO(kirjs): Figure out what's the deal with all those new anys.
export function* fetchAuthUsers(): any {
  const authApi = yield call(configureAuthSaga);
  try {
    const users = yield call([authApi, 'fetchUsers']);
    yield put(authFetchUsersSuccess(users));
  } catch (e) {
    yield put(authFetchUsersError({ message: 'Error when fetching users' }));
  }
}

export const AUTH_API_CONTEXT = 'AUTH_API_CONTEXT';

export function* initAuth({ payload }: ActionType<typeof updateAuthConfig>) {
  if (!payload) {
    return;
  }
  yield setContext({
    [AUTH_API_CONTEXT]: new AuthApi(
      payload.auth.hostAndPort,
      payload.projectId
    ),
  });
  yield all([
    takeLatest(getType(authFetchUsersRequest), fetchAuthUsers),
    takeLatest(getType(createUserRequest), createUser),
    takeLatest(getType(nukeUsersRequest), nukeUsers),
    takeLatest(getType(deleteUserRequest), deleteUser),
    takeLatest(getType(updateUserRequest), updateUser),
    takeLatest(getType(setUserDisabledRequest), setUserDisabled),
    takeLatest(
      getType(setAllowDuplicateEmailsRequest),
      setAllowDuplicateEmails
    ),
    takeLatest(
      getType(getAllowDuplicateEmailsRequest),
      getAllowDuplicateEmails
    ),
    put(authFetchUsersRequest()),
    put(getAllowDuplicateEmailsRequest()),
  ]);
}

export function* deleteUser({ payload }: ReturnType<typeof deleteUserRequest>) {
  const authApi: AuthApi = yield call(configureAuthSaga);

  yield call([authApi, 'deleteUser'] as any, {
    localId: payload.localId,
  });
  yield put(deleteUserSuccess({ localId: payload.localId }));
}

export function* createUser({ payload }: ReturnType<typeof createUserRequest>) {
  const authApi: AuthApi = yield call(configureAuthSaga);

  try {
    yield put(setAuthUserDialogLoading(true));

    const newUser: AuthUser = yield call([authApi, 'createUser'], payload.user);

    const user = {
      ...newUser,
      ...payload.user,
    };

    if (payload.user.customAttributes) {
      yield call([authApi, 'updateUser'], user);
    }

    yield put(
      createUserSuccess({
        user: newUser,
      })
    );

    if (!payload.keepDialogOpen) {
      yield put(clearAuthUserDialogData());
    }
  } catch (e) {
    yield put(setAuthUserDialogError(e.message));
  } finally {
    yield put(setAuthUserDialogLoading(false));
  }
}

export function* updateUser({ payload }: ReturnType<typeof updateUserRequest>) {
  const authApi: AuthApi = yield call(configureAuthSaga);
  try {
    yield put(setAuthUserDialogLoading(true));
    const user: AuthUser = yield call([authApi, 'updateUser'] as any, {
      ...payload.user,
      localId: payload.localId,
    });
    yield put(updateUserSuccess({ user: { ...user, ...payload.user } }));
    yield put(clearAuthUserDialogData());
  } catch (e) {
    yield put(setAuthUserDialogError(e.message));
  } finally {
    yield put(setAuthUserDialogLoading(false));
  }
}

export function* setUserDisabled({
  payload,
}: ReturnType<typeof setUserDisabledRequest>) {
  const authApi: AuthApi = yield call(configureAuthSaga);
  yield call([authApi, 'updateUser'] as any, {
    disableUser: payload.disabled,
    localId: payload.localId,
  });
  yield put(setUserDisabledSuccess(payload));
}

export function* setAllowDuplicateEmails({
  payload,
}: ReturnType<typeof setAllowDuplicateEmailsRequest>) {
  const authApi: AuthApi = yield call(configureAuthSaga);
  yield call([authApi, 'updateConfig'], payload);
  yield put(setAllowDuplicateEmailsSuccess(payload));
}

export function* getAllowDuplicateEmails() {
  const authApi: AuthApi = yield call(configureAuthSaga);
  const config: boolean = yield call([authApi, 'getConfig']);
  yield put(setAllowDuplicateEmailsSuccess(config));
}

export function* nukeUsers() {
  const authApi: AuthApi = yield call(configureAuthSaga);
  yield call([authApi, 'nukeUsers']);
  yield put(nukeUsersSuccess());
}

export function* configureAuthSaga(): Generator {
  const api = yield getContext(AUTH_API_CONTEXT);
  return api;
}

export function* authSaga() {
  yield takeLatest(getType(updateAuthConfig), initAuth);
}
