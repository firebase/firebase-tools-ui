import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouterProps } from 'react-router';
import { MemoryRouter } from 'react-router-dom';

import configureStore from '../../../configureStore';
import { fetchSuccess } from '../../../store/config/actions';

export const FirestoreProviders: React.FC<MemoryRouterProps> = props => {
  const store = configureStore();
  store.dispatch(
    fetchSuccess({
      projectId: 'foo',
      firestore: {
        hostAndPort: 'goo.gl:1234',
        host: 'goo.gl',
        port: 1234,
      },
    })
  );

  return (
    <Provider store={store}>
      <MemoryRouter {...props} />
    </Provider>
  );
};
