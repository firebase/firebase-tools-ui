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

import { Button } from '@rmwc/button';
import { GridCell } from '@rmwc/grid';
import React, { useCallback, useEffect, useState } from 'react';

import { Callout } from '../common/Callout';
import { CONSOLE_ROOT } from '../common/constants';

const DISMISS_KEY = 'isLocalWarningCalloutDismissed';

export const LocalWarningCallout: React.FC<
  React.PropsWithChildren<{
    projectId: string;
  }>
> = ({ projectId }) => {
  // Default to false to reduce layout flashes if already dismissed.
  const [showWarning, setShowWarning] = useState(false);
  useEffect(() => {
    // Set to true only if localStorage is accessible and not dismissed before.
    const val = localStorage.getItem(DISMISS_KEY);
    if (val !== 'true') {
      setShowWarning(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    setShowWarning(false);
    localStorage.setItem(DISMISS_KEY, 'true');
  }, [setShowWarning]);

  if (!showWarning) {
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
              aria-label={`View this project, ${projectId}, in the firebase console`}
            />
            <Button label="Dismiss" aria-label="Dismiss this reminder banner" onClick={dismiss} />
          </>
        }
      >
        Remember this is a local environment. Visit the production version of{' '}
        <strong>{projectId}</strong> in the console.
      </Callout>
    </GridCell>
  );
};
