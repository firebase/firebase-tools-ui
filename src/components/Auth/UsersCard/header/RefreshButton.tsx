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

import { IconButton } from '@rmwc/icon-button';
import React from 'react';
import { MapDispatchToPropsFunction, connect } from 'react-redux';

import { authFetchUsersRequest } from '../../../../store/auth/actions';

export const RefreshButton: React.FC<PropsFromDispatch> = ({ refresh }) => {
  return (
    <IconButton
      onClick={refresh}
      icon="refresh"
      label="Refresh"
      theme="secondary"
    />
  );
};

export interface PropsFromDispatch {
  refresh: typeof authFetchUsersRequest;
}

export const mapDispatchToProps: MapDispatchToPropsFunction<
  PropsFromDispatch,
  {}
> = (dispatch) => {
  return {
    refresh: () => dispatch(authFetchUsersRequest()),
  };
};

export default connect(null, mapDispatchToProps)(RefreshButton);
