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

import './DetailsHeader.scss';

import { Card } from '@rmwc/card';
import { Elevation } from '@rmwc/elevation';
import React from 'react';

import { ExtensionsTable } from '../List/ExtensionsTable/ExtensionTable';
import { Extension } from '../models';

export interface DetailsHeaderProps {
  extension: Extension;
}

export const DetailsHeader: React.FC<DetailsHeaderProps> = ({ extension }) => {
  return (
    <Card className="detailsHeader">
      <Elevation z="2" wrap>
        <ExtensionsTable extensions={[extension]}></ExtensionsTable>
      </Elevation>
    </Card>
  );
};
