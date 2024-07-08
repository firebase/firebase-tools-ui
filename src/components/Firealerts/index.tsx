/**
 * Copyright 2024 Google LLC
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

import React, { Suspense } from 'react';

import { useIsEmulatorDisabled } from '../common/EmulatorConfigProvider';
import { EmulatorDisabled } from '../common/EmulatorDisabled';
import { Spinner } from '../common/Spinner';
import { useFirealertsTriggers } from './api/internal/useFirealertsTriggers';
import { FirealertsProvider } from './api/useFirealerts';
import { FirealertsForm } from './Form/FirealertsForm';

export const FirealertsRoute: React.FC = () => {
  return (
    <Suspense fallback={<FirealertsRouteSuspended />}>
      <HydrateFirealerts>
        <FirealertsForm />
      </HydrateFirealerts>
    </Suspense>
  );
};

const HydrateFirealerts: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const functions = useFirealertsTriggers();
  return (
    <FirealertsProvider triggers={functions}>{children}</FirealertsProvider>
  );
};
const FirealertsRouteSuspended: React.FC<
  React.PropsWithChildren<unknown>
> = () => {
  const isDisabled = useIsEmulatorDisabled('eventarc');
  return isDisabled ? (
    <EmulatorDisabled productName="FireAlerts" />
  ) : (
    <Spinner span={12} message="FireAlerts Emulator Loading..." />
  );
};

export default FirealertsRoute;
