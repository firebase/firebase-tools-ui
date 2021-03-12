import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { AppState } from '../../../store';

export const FakeStorageStoreProvider: React.FC = ({ children }) => {
  const projectId = '';
  const host = 'localhost';
  const port = 9199;
  const hostAndPort = host + ':' + port;

  const store = configureStore<Pick<AppState, 'config'>>()({
    config: {
      loading: false,
      result: {
        data: {
          projectId,
          storage: { hostAndPort, host, port: Number(port) },
        },
      },
    },
  });
  return <Provider store={store}>{children}</Provider>;
};
