import { createAction } from 'typesafe-actions';

import { AddAuthUserPayload, AuthUser } from '../../components/Auth/types';
import { RemoteResult } from '../utils';

export const createUserRequest = createAction('@auth/CREATE_USER_REQUEST')<{
  user: AddAuthUserPayload;
  keepDialogOpen?: boolean;
}>();

export const createUserSuccess = createAction('@auth/CREATE_USER_SUCCESS')<{
  user: AuthUser;
}>();

export const updateUserRequest = createAction('@auth/UPDATE_USER_REQUEST')<{
  user: AddAuthUserPayload;
  localId: string;
}>();

export const updateUserSuccess = createAction('@auth/UPDATE_USER_SUCCESS')<{
  user: AuthUser;
}>();

export const setUserDisabledRequest = createAction(
  '@auth/SET_USER_DISABLED_REQUEST'
)<{
  localId: string;
  disabled: boolean;
}>();

export const setUserDisabledSuccess = createAction(
  '@auth/SET_USER_DISABLED_SUCCESS'
)<{
  localId: string;
  disabled: boolean;
}>();

export const deleteUserRequest = createAction('@auth/DELETE_USER_REQUEST')<{
  localId: string;
}>();

export const deleteUserSuccess = createAction('@auth/DELETE_USER_SUCCESS')<{
  localId: string;
}>();

export const updateFilter = createAction('@auth/UPDATE_FILTER')<{
  filter: string;
}>();

export const nukeUsersRequest = createAction('@auth/NUKE_USERS_REQUEST')();

export const nukeUsersSuccess = createAction('@auth/NUKE_USERS_SUCCESS')();

export const authFetchUsersRequest = createAction(
  '@auth/AUTH_FETCH_USERS_REQUEST'
)();

export const authFetchUsersSuccess = createAction(
  '@auth/AUTH_FETCH_USERS_SUCCESS'
)<AuthUser[]>();

export const authFetchUsersError = createAction(
  '@auth/AUTH_FETCH_USERS_ERROR'
)<{ message: string }>();

export const setAllowDuplicateEmailsRequest = createAction(
  '@auth/SET_ALLOW_DUPLICATE_EMAILS_REQUEST'
)<boolean>();

export const setAllowDuplicateEmailsSuccess = createAction(
  '@auth/SET_ALLOW_DUPLICATE_EMAILS_SUCCESS'
)<boolean>();

export const getAllowDuplicateEmailsRequest = createAction(
  '@auth/GET_ALLOW_DUPLICATE_EMAILS_REQUEST'
)();

export const getAllowDuplicateEmailsSuccess = createAction(
  '@auth/GET_ALLOW_DUPLICATE_EMAILS_SUCCESS'
)<boolean>();

export const openAuthUserDialog = createAction(
  '@auth/SET_AUTH_USER_DIALOG_DATA'
)<RemoteResult<AuthUser | undefined>>();

export const setAuthUserDialogLoading = createAction(
  '@auth/SET_AUTH_USER_DIALOG_DATA_LOADING'
)<boolean>();

export const setAuthUserDialogError = createAction(
  '@auth/SET_AUTH_USER_DIALOG_DATA_ERRORS'
)<string | undefined>();

export const clearAuthUserDialogData = createAction(
  '@auth/CLEAR_AUTH_USER_DIALOG_DATA'
)();
