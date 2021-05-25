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

import './index.scss';

import { Snackbar } from '@rmwc/snackbar';
import React from 'react';

export const SNACKBAR_MESSAGE = 'Request path copied to clipboard';

interface Props {
  showCopyNotification: boolean;
  setShowCopyNotification: (value: boolean) => void;
  timeout?: number;
}

const CopyPathNotification: React.FC<Props> = ({
  showCopyNotification,
  setShowCopyNotification,
  timeout,
}) => (
  <Snackbar
    className="Firestore-Requests-Copy-Path-Snackbar"
    open={showCopyNotification}
    onClose={() => setShowCopyNotification(false)}
    message={SNACKBAR_MESSAGE}
    icon={{ icon: 'check_circle', size: 'medium' }}
    timeout={timeout}
  />
);

export default CopyPathNotification;
