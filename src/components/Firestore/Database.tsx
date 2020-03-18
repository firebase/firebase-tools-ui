/**
 * Copyright 2019 Google LLC
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

import './index.scss';

import { Typography } from '@rmwc/typography';
import React from 'react';

import { CollectionList } from './CollectionList';

export interface Props {
  name: string;
}

export const Database: React.FC<Props> = ({ name }) => {
  return (
    <div className="Firestore-Database">
      <Typography use="headline5">
        Database: <code>{name}</code>
      </Typography>
      <CollectionList />
    </div>
  );
};
