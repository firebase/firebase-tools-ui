import { all, call, put, select, take, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import AuthApi from '../../components/Auth/api';
import { AuthUser } from '../../components/Auth/types';
import { fetchSuccess } from '../config';
import { getProjectIdResult } from '../config/selectors';
import {
  authFetchUsersError,
  authFetchUsersRequest,
  authFetchUsersSuccess,
  createUserRequest,
  createUserSuccess,
  deleteUserRequest,
  deleteUserSuccess,
  getAllowDuplicateEmailsRequest,
  nukeUsersRequest,
  nukeUsersSuccess,
  setAllowDuplicateEmailsRequest,
  setAllowDuplicateEmailsSuccess,
  setUserDisabledRequest,
  setUserDisabledSuccess,
  updateUserRequest,
  updateUserSuccess,
} from './actions';
import { getAuthConfigResult } from './selectors';

export function* fetchAuthUsers() {
  const authApi = yield call(configureAuthSaga);
  try {
    const users = yield call([authApi, 'fetchUsers']);
    yield put(authFetchUsersSuccess(users));
  } catch (e) {
    yield put(authFetchUsersError({ message: 'Error when fetching users' }));
  }
}

export function* deleteUser({ payload }: ReturnType<typeof deleteUserRequest>) {
  const authApi = yield call(configureAuthSaga);
  yield call([authApi, 'deleteUser'], { localId: payload.localId });
  yield put(deleteUserSuccess({ localId: payload.localId }));
}

export function* createUser({ payload }: ReturnType<typeof createUserRequest>) {
  const authApi = yield call(configureAuthSaga);
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
}

export function* updateUser({ payload }: ReturnType<typeof updateUserRequest>) {
  const authApi = yield call(configureAuthSaga);

  const user: AuthUser = yield call([authApi, 'updateUser'], {
    ...payload.user,
    localId: payload.localId,
  });
  yield put(updateUserSuccess({ user: { ...user, ...payload.user } }));
}

export function* setUserDisabled({
  payload,
}: ReturnType<typeof setUserDisabledRequest>) {
  const authApi = yield call(configureAuthSaga);
  yield call([authApi, 'updateUser'], {
    disableUser: payload.disabled,
    localId: payload.localId,
  });
  yield put(setUserDisabledSuccess(payload));
}

export function* setAllowDuplicateEmails({
  payload,
}: ReturnType<typeof setAllowDuplicateEmailsRequest>) {
  const authApi = yield call(configureAuthSaga);
  yield call([authApi, 'updateConfig'], payload);
  yield put(setAllowDuplicateEmailsSuccess(payload));
}

export function* getAllowDuplicateEmails() {
  const authApi = yield call(configureAuthSaga);
  const config = yield call([authApi, 'getConfig']);
  yield put(setAllowDuplicateEmailsSuccess(config));
}

export function* nukeUsers() {
  const authApi = yield call(configureAuthSaga);
  yield call([authApi, 'nukeUsers']);
  yield put(nukeUsersSuccess());
}

export function* configureAuthSaga() {
  const {
    data: { hostAndPort },
  } = yield select(getAuthConfigResult);

  const { data: projectId } = yield select(getProjectIdResult);

  return new AuthApi(hostAndPort, projectId);
}

export function* authSaga() {
  yield take(fetchSuccess);

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
