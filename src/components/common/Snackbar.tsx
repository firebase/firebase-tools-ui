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

import './Snackbar.scss';

import { Snackbar as RmwcSnackbar } from '@rmwc/snackbar';
import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  timeout?: number;
  message: string;
}

const Snackbar: React.FC<Props> = ({ open, onClose, timeout, message }) => (
  <RmwcSnackbar
    className=".Emulator-Snackbar"
    open={open}
    onClose={onClose}
    message={message}
    icon={{ icon: 'check_circle', size: 'medium' }}
    timeout={timeout}
  />
);

export default Snackbar;
