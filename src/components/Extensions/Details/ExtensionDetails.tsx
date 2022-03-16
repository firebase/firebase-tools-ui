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

import { GridCell } from '@rmwc/grid';
import React from 'react';

import { useExtension } from '../api/useExtension';
import { RedirectToList } from '../index';
import { DetailsCard } from './DetailCard/DetailsCard';
import { DetailsHeader } from './DetailsHeader';
import { ExtensionFeatureBar } from '../FeatureBar/FeatureBar';

export const ExtensionDetails: React.FC = () => {
  const extension = useExtension();

  // Redirect to list-view if there is no matching instance-id
  if (!extension) return <RedirectToList />;

  return (
    <GridCell span={12} className="Extensions">
      <ExtensionFeatureBar name={extension.displayName || ''} />
      <DetailsHeader extension={extension}></DetailsHeader>
      <DetailsCard extension={extension}></DetailsCard>
    </GridCell>
  );
};
