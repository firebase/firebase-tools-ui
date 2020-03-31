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
import './EmulatorDisabled.scss';

import { Card } from '@rmwc/card';
import { GridCell } from '@rmwc/grid';
import { Typography } from '@rmwc/typography';
import React from 'react';

import { HintIcon } from './icons';

export const EmulatorDisabled: React.FC<{
  productName: string;
}> = ({ productName }) => (
  <>
    <GridCell desktop={2} tablet={0} phone={0}>
      {/* Spacing */}
    </GridCell>
    <GridCell span={8} align="middle">
      <Card className="EmulatorDisabled">
        <div className="EmulatorDisabled-graphics">
          <img src="/assets/img/database.png" alt="" />
        </div>
        <div className="EmulatorDisabled-description">
          <Typography use="headline6" tag="h3">
            The {productName} Emulator is currently not running.
          </Typography>
          <Typography use="body1" tag="p">
            If you are not using {productName} in your testing, everything is
            fine. If you want to use {productName} in your testing, then the
            best way to set it up and start it is to run the following command
            initialize the {productName} Emulator:{' '}
            <code>firebase init emulators</code>. Followed by:{' '}
            <code>firebase emulators:start</code>.
          </Typography>
          <Typography use="body1" tag="p">
            <a href="https://firebase.google.com/docs/emulator-suite/install_and_configure#configure_emulator_suite">
              <HintIcon size="xsmall" /> Learn more
            </a>
          </Typography>
        </div>
      </Card>
    </GridCell>
  </>
);
