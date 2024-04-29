/**
 * Copyright 2020 Google LLC
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

import { Card } from '@rmwc/card';
import { Elevation } from '@rmwc/elevation';
import { GridCell } from '@rmwc/grid';
import React from 'react';

import { useScheduled } from '../api/useScheduled';
import { ScheduledTable } from './ScheduledTable/ScheduledTable';
import { ZeroState } from './ZeroState';

export const ScheduledList: React.FC<React.PropsWithChildren<unknown>> = () => {
  const specs = useScheduled();

  return (
    <GridCell span={12} className="Scheduled">
      <Elevation z="2" wrap>
        <Card>
          {specs.length ? (
            <ScheduledTable functions={specs} />
          ) : (
            <ZeroState></ZeroState>
          )}
        </Card>
      </Elevation>
    </GridCell>
  );
};
