/**
 * Copyright 2022 Google LLC
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
import { Route, Switch } from 'react-router-dom';

import { useIsEmulatorDisabled } from '../common/EmulatorConfigProvider';
import { EmulatorDisabled } from '../common/EmulatorDisabled';
import { Spinner } from '../common/Spinner';
import { useScheduledFunctions } from './api/internal/useScheduledFunctions';
import { ScheduledProvider } from './api/useScheduled';
import { ScheduledList } from './List/List';

export const ScheduledRoute: React.FC<
  React.PropsWithChildren<unknown>
> = () => {
  return (
    <Suspense fallback={<ScheduledRouteSuspended />}>
      <HydrateScheduled>
        <Switch>
          <Route path="/scheduled" component={ScheduledList} />
        </Switch>
      </HydrateScheduled>
    </Suspense>
  );
};

export default ScheduledRoute;

const HydrateScheduled: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const functions = useScheduledFunctions();

  return (
    <ScheduledProvider scheduled={functions}>{children}</ScheduledProvider>
  );
};

const ScheduledRouteSuspended: React.FC<
  React.PropsWithChildren<unknown>
> = () => {
  const isDisabled = useIsEmulatorDisabled('scheduled');
  return isDisabled ? (
    <EmulatorDisabled productName="Scheduled" />
  ) : (
    <Spinner span={12} message="Scheduled Emulator Loading..." />
  );
};
