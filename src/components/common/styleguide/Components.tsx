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

import './Components.scss';

import { Button } from '@rmwc/button';
import { Card } from '@rmwc/card';
import { GridCell, GridInner } from '@rmwc/grid';
import { Theme } from '@rmwc/theme';
import { Typography } from '@rmwc/typography';
import React from 'react';

import { CustomThemeProvider } from '../../../themes';

export const Components: React.FC = () => {
  return (
    <GridCell span={12}>
      <Typography use="headline2" tag="h1">
        Buttons
      </Typography>
      <GridInner className="Components" span={12}>
        <GridCell span={6}>
          <Card className="Buttons">
            <Typography use="headline4" tag="h1">
              On background
            </Typography>

            {[true, false].map(unelevated => (
              <React.Fragment key={'' + unelevated}>
                <table>
                  <thead>
                    <tr>
                      <th>Primary</th>
                      <th>Secondary</th>
                      <th>Warning</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {/* Regular */}
                      <td>
                        <Button unelevated={unelevated} label="Default" />
                        <br />
                        <br />
                        <Button
                          unelevated={unelevated}
                          disabled
                          label="Disabled"
                        />
                      </td>
                      <td>
                        <Button
                          theme="secondary"
                          unelevated={unelevated}
                          label="Default"
                        />
                        <br />
                        <br />
                        <Button
                          theme="secondary"
                          unelevated={unelevated}
                          disabled
                          label="Disabled"
                        />
                      </td>
                      <CustomThemeProvider use="warning" wrap>
                        <td>
                          <Button unelevated={unelevated} label="Default" />
                          <br />
                          <br />
                          <Button
                            unelevated={unelevated}
                            disabled
                            label="Disabled"
                          />
                        </td>
                      </CustomThemeProvider>
                    </tr>
                  </tbody>
                </table>
              </React.Fragment>
            ))}
          </Card>
        </GridCell>
        <GridCell span={6}>
          <Card theme={['primaryBg', 'onPrimary']} className="Buttons">
            <Typography use="headline4" tag="h1">
              On primary/dark
            </Typography>

            {[true, false].map(unelevated => (
              <React.Fragment key={'' + unelevated}>
                <table>
                  <thead>
                    <tr>
                      <th>Primary</th>
                      <th>Secondary</th>
                      <th>Warning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* On Primary */}
                    <Theme use={['primaryBg', 'onPrimary']} wrap>
                      <tr>
                        <td>
                          <Button unelevated={unelevated} label="Default" />
                          <br />
                          <br />
                          <Button
                            unelevated={unelevated}
                            disabled
                            label="Disabled"
                          />
                        </td>
                        <td>
                          <Button
                            theme="secondary"
                            unelevated={unelevated}
                            label="Default"
                          />
                          <br />
                          <br />
                          <Button
                            theme="secondary"
                            unelevated={unelevated}
                            disabled
                            label="Disabled"
                          />
                        </td>
                        <CustomThemeProvider use="warning" wrap>
                          <td>
                            <Button unelevated={unelevated} label="Default" />
                            <br />
                            <br />
                            <Button
                              unelevated={unelevated}
                              disabled
                              label="Disabled"
                            />
                          </td>
                        </CustomThemeProvider>
                      </tr>
                    </Theme>
                  </tbody>
                </table>
              </React.Fragment>
            ))}
          </Card>
        </GridCell>
      </GridInner>
    </GridCell>
  );
};
