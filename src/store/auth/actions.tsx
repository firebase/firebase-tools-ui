import { createAction } from 'typesafe-actions';

import { AddAuthUserPayload } from '../../components/Auth/types';

export const addUser = createAction('@auth/addUser')<{
  user: AddAuthUserPayload;
}>();

export const updateUser = createAction('@auth/updateUser')<{
  user: AddAuthUserPayload;
  localId: string;
}>();

export const setUserDisabled = createAction('@auth/setUserDisabled')<{
  localId: string;
  disabled: boolean;
}>();

export const deleteUser = createAction('@auth/deleteUser')<{
  localId: string;
}>();

export const updateFilter = createAction('@auth/updateFilter')<{
  filter: string;
}>();

export const clearAllData = createAction('@auth/clearAll')();
