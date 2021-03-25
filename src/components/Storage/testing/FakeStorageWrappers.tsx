import React, { Suspense } from 'react';

import { StorageFirebaseAppProvider } from '../providers/StorageFirebaseAppProvider';
import { FakeFirebaseRouterProvider } from './FakeFirebaseRouterProvider';
import { FakeStorageStoreProvider } from './FakeStorageStoreProvider';

export interface StorageTestWrappersProps {
  fallbackTestId: string;
}

export const FakeStorageWrappers: React.FC<StorageTestWrappersProps> = ({
  children,
  fallbackTestId,
}) => {
  return (
    <FakeStorageStoreProvider>
      <Suspense fallback={<div data-testid={fallbackTestId} />}>
        <StorageFirebaseAppProvider>
          <FakeFirebaseRouterProvider>{children}</FakeFirebaseRouterProvider>
        </StorageFirebaseAppProvider>
      </Suspense>
    </FakeStorageStoreProvider>
  );
};
