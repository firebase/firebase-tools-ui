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

import React from 'react';
import { ThemeProvider, Theme } from '@rmwc/theme';
import { Typography } from '@rmwc/typography';
import { grey100 } from '../../colors';
import './PanelHeader.scss';

export const PanelHeader: React.FC<{ id: string; icon: React.ReactNode }> = ({
  id,
  icon,
}) => {
  return (
    <ThemeProvider options={{ surface: grey100 }}>
      <Theme use={['surface']} wrap>
        <div className="Firestore-PanelHeader">
          <Theme use={['textSecondaryOnBackground']}>{icon}</Theme>
          <Typography use="body1" className="Firestore-PanelHeader-title">
            {id}
          </Typography>
        </div>
      </Theme>
    </ThemeProvider>
  );
};

export default PanelHeader;
