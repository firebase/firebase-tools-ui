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

import './NoResults.scss';

import { Typography } from '@rmwc/typography';
import React from 'react';

export const NO_RESULTS_MESSAGE = 'No results';

const RequestsNoResults: React.FC<React.PropsWithChildren<unknown>> = () => {
  return (
    <Typography
      use="body2"
      aria-live="polite"
      theme="textSecondaryOnBackground"
      className="Firestore-Requests-Table-No-Results"
    >
      {NO_RESULTS_MESSAGE}
    </Typography>
  );
};

export default RequestsNoResults;
