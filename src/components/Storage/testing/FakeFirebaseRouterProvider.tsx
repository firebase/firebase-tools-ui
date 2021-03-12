import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';

import { StorageRoute } from '../index';

export const FakeFirebaseRouterProvider: React.FC = ({ children }) => {
  const history = createMemoryHistory({
    initialEntries: [`/storage/`],
  });

  return (
    <Router history={history}>
      <StorageRoute>{children}</StorageRoute>
    </Router>
  );
};
