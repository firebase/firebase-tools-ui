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
> = dispatch => {
  return {
    refresh: () => dispatch(authFetchUsersRequest()),
  };
};

export default connect(null, mapDispatchToProps)(RefreshButton);
