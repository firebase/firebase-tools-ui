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

import { useLocalStorage, writeStorage } from '@rehooks/local-storage';
import { Button } from '@rmwc/button';
import { GridCell } from '@rmwc/grid';
import React from 'react';

import { Callout } from '../common/Callout';
import { CONSOLE_ROOT } from '../common/constants';

const DISMISS_KEY = 'isLocalWarningCalloutDismissed';

export const LocalWarningCallout: React.FC<{
  projectId: string;
}> = ({ projectId }) => {
  const [isDismissed] = useLocalStorage<boolean>(DISMISS_KEY);

  if (isDismissed) {
    return null;
  }

  return (
    <GridCell span={12}>
      <Callout
        type="note"
        actions={
          <>
            <Button
              tag="a"
              href={`${CONSOLE_ROOT}/project/${projectId}/overview`}
              target="_blank"
              label="View project"
            />
            <Button
              label="Dismiss"
              onClick={() => writeStorage(DISMISS_KEY, true)}
            />
          </>
        }
      >
        Remember this is a local environment. Visit the production version of{' '}
        <strong>{projectId}</strong> in the console.
      </Callout>
    </GridCell>
  );
};
