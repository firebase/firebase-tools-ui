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
import { Card } from '@rmwc/card';
import { Typography } from '@rmwc/typography';
import React, { useState } from 'react';
import { connect } from 'react-redux';

import { createStructuredSelector } from '../../../store';
import { getUsageMode } from '../../../store/auth/selectors';
import { UsageModes } from '../types';
import styles from './PassthroughModeCard.module.scss';
import PassthroughModeDialog from './PassthroughModeDialog';

const ENABLED_HEADING = 'Passthrough mode enabled';
const DISABLED_HEADING = 'Passthrough mode';

export  const ENABLED_COPY =
  'This mode is a form of custom auth that does not persist users in Firebase Auth emulator.';
export const DISABLED_COPY =
  'This mode is a form of custom auth that does not persist users in Firebase Auth backend.';

export type PassthroughModeCardProps = PropsFromStore;
export const PassthroughModeCard: React.FC<PassthroughModeCardProps> = ({
  usageMode,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className={styles.wrapper}>
        <div>
          <Typography use="headline6" tag="div" theme="textPrimaryOnBackground">
            {usageMode === UsageModes.PASSTHROUGH
              ? ENABLED_HEADING
              : DISABLED_HEADING}
          </Typography>
          <Typography use="body2" theme="textPrimaryOnBackground">
            {usageMode === UsageModes.PASSTHROUGH
              ? ENABLED_COPY
              : DISABLED_COPY}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://firebase.google.com/docs/auth"
            >
              Learn more
            </a>
          </Typography>
        </div>
        <div>
          <Button outlined={true} onClick={() => setOpen(true)}>
            {usageMode === UsageModes.PASSTHROUGH ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </Card>
      {open && <PassthroughModeDialog onClose={() => setOpen(false)} />}
    </>
  );
};
export const mapStateToProps = createStructuredSelector({
  usageMode: getUsageMode,
});

export type PropsFromStore = ReturnType<typeof mapStateToProps>;
export default connect(mapStateToProps)(PassthroughModeCard);
