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
  take,
  takeLatest,
} from 'redux-saga/effects';
import { ActionType, getType } from 'typesafe-actions';

import AuthApi from '../../components/Auth/api';
import {
  AuthUser,
  EmulatorV1ProjectsConfig,
} from '../../components/Auth/types';
import {
  authFetchTenantsRequest,
  authFetchTenantsSuccess,
  authFetchUsersError,
  authFetchUsersRequest,
  authFetchUsersSuccess,
  clearAuthUserDialogData,
  createUserRequest,
  createUserSuccess,
  deleteUserRequest,
  deleteUserSuccess,
  getAllowDuplicateEmailsRequest,
  getUsageModeRequest,
  nukeUsersForAllTenantsRequest,
  nukeUsersForAllTenantsSuccess,
  nukeUsersRequest,
  nukeUsersSuccess,
  setAllowDuplicateEmailsRequest,
  setAllowDuplicateEmailsSuccess,
  setAuthUserDialogError,
  setAuthUserDialogLoading,
  setUsageModeRequest,
  setUsageModeSuccess,
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

export function* fetchTenants(): any {
  const authApi = yield call(configureAuthSaga);
  const tenants = yield call([authApi, 'fetchTenants']);
  yield put(authFetchTenantsSuccess(tenants));
}

export const AUTH_API_CONTEXT = 'AUTH_API_CONTEXT';

export function* initAuth({ payload }: ActionType<typeof updateAuthConfig>) {
  if (!payload) {
    return;
  }
  yield setContext({
    [AUTH_API_CONTEXT]: new AuthApi(
      payload.auth.hostAndPort,
      payload.projectId,
      payload.tenantId
    ),
  });
  yield all([
    takeLatest(getType(authFetchUsersRequest), fetchAuthUsers),
    takeLatest(getType(authFetchTenantsRequest), fetchTenants),
    takeLatest(getType(createUserRequest), createUser),
    takeLatest(getType(nukeUsersRequest), nukeUsers),
    takeLatest(getType(nukeUsersForAllTenantsRequest), nukeUsersForAllTenants),
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
    takeLatest(getType(setUsageModeRequest), setUsageMode),
    takeLatest(getType(getUsageModeRequest), getUsageMode),
    put(authFetchUsersRequest()),
    put(authFetchTenantsRequest()),
    put(getAllowDuplicateEmailsRequest()),
    put(getUsageModeRequest()),
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
  yield call([authApi, 'updateConfig'], {
    signIn: { allowDuplicateEmails: payload },
  });
  yield put(setAllowDuplicateEmailsSuccess(payload));
}

export function* setUsageMode({
  payload,
}: ReturnType<typeof setUsageModeRequest>) {
  const authApi: AuthApi = yield call(configureAuthSaga);

  // passthrough mode can't be enabled until all users are deleted
  if (payload === 'PASSTHROUGH') {
    yield put(nukeUsersForAllTenantsRequest());
    yield take(getType(nukeUsersForAllTenantsSuccess));
  }

  yield call([authApi, 'updateConfig'], { usageMode: payload });
  yield put(setUsageModeSuccess(payload));
}

export function* getAllowDuplicateEmails() {
  const authApi: AuthApi = yield call(configureAuthSaga);
  const config: EmulatorV1ProjectsConfig = yield call([authApi, 'getConfig']);
  const allowDuplicateEmails = config.signIn?.allowDuplicateEmails;

  if (allowDuplicateEmails === undefined) {
    throw new Error(
      'Did not get a "signIn.allowDuplicateEmails" setting from config API'
    );
  }

  yield put(setAllowDuplicateEmailsSuccess(config.signIn.allowDuplicateEmails));
}

export function* getUsageMode() {
  const authApi: AuthApi = yield call(configureAuthSaga);
  const config: EmulatorV1ProjectsConfig = yield call([authApi, 'getConfig']);
  const usageMode = config.usageMode;
  if (config === undefined) {
    throw new Error('Did not get a "usageMode" setting from config API');
  }

  yield put(setUsageModeSuccess(usageMode));
}

export function* nukeUsers() {
  const authApi: AuthApi = yield call(configureAuthSaga);
  yield call([authApi, 'nukeUsers']);
  yield put(nukeUsersSuccess());
}

export function* nukeUsersForAllTenants() {
  const authApi: AuthApi = yield call(configureAuthSaga);
  yield call([authApi, 'nukeUsersForAllTenants']);
  yield put(nukeUsersForAllTenantsSuccess());
}

export function* configureAuthSaga(): Generator {
  const api = yield getContext(AUTH_API_CONTEXT);
  return api;
}

export function* authSaga() {
  yield takeLatest(getType(updateAuthConfig), initAuth);
}
